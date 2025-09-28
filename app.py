from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from whitenoise import WhiteNoise
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote_plus
import re
import time
import os

app = Flask(__name__)
app.wsgi_app = WhiteNoise(app.wsgi_app, root="static/")
CORS(app)

# Configure static folder
app.static_folder = 'static'

def extract_player_urls(base_url):
    """
    Extract all player URLs from a movie or series page
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Get the main page
        response = requests.get(base_url, headers=headers, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title_element = soup.find('h1', class_='entry-title')
        title = title_element.get_text().strip() if title_element else "Unknown Title"
        
        # Check if this is a series page by looking for episode links
        episode_links = soup.find_all('a', href=re.compile(r'/eps/'))
        is_series = '/tv/' in base_url or len(episode_links) > 0 or 'episode' in title.lower()
        
        if is_series and episode_links:
            # This is a series page with episodes, extract episode information
            return extract_series_episodes(base_url, soup, headers, title)
        else:
            # This is a movie page, extract player URLs directly
            return extract_movie_players(base_url, soup, headers, title)
            
    except Exception as e:
        return {"error": f"Failed to extract players: {str(e)}"}

def search_movies_series(query, content_type=None):
    """
    Search for movies and series on the website
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Construct search URL
        search_url = f"https://new17.ngefilm.site/?s={quote_plus(query)}"
        
        # Add content type filter if specified
        if content_type:
            search_url += f"&post_type[]={content_type}"
        else:
            # Search both movies and series
            search_url += "&post_type[]=post&post_type[]=tv"
        
        print(f"Searching: {search_url}")
        
        # Perform search
        response = requests.get(search_url, headers=headers, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find search results
        results = []
        
        # Look for movie/series items in the search results
        items = soup.find_all('article', class_='item-infinite')
        if not items:
            # Try alternative selectors
            items = soup.find_all('article', attrs={'itemscope': True})
        
        for item in items:
            try:
                # Extract title
                title_element = item.find('h2', class_='entry-title')
                if not title_element:
                    title_element = item.find('h2')
                
                title = ""
                if title_element:
                    title_link = title_element.find('a')
                    if title_link:
                        title = title_link.get_text().strip()
                
                # Extract URL
                url = ""
                title_link = item.find('a', href=True) if title_element else None
                if title_link:
                    url = title_link.get('href')
                
                # Extract image
                image_url = ""
                img_element = item.find('img')
                if img_element:
                    image_url = img_element.get('data-src') or img_element.get('src')
                
                # Extract rating
                rating = ""
                rating_element = item.find(class_=re.compile(r'rating'))
                if rating_element:
                    rating_text = rating_element.get_text().strip()
                    # Extract numeric rating if possible
                    rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                    if rating_match:
                        rating = rating_match.group(1)
                
                # Extract type (movie or series)
                type_indicator = "Unknown"
                if '/tv/' in url:
                    type_indicator = "Series"
                elif '/eps/' in url:
                    type_indicator = "Episode"
                else:
                    type_indicator = "Movie"
                
                # Only add if we have a title and URL
                if title and url:
                    results.append({
                        'title': title,
                        'url': url,
                        'image_url': image_url,
                        'rating': rating,
                        'type': type_indicator
                    })
                    
            except Exception as e:
                print(f"Error processing search result: {e}")
                continue
        
        # If no results found with article selector, try a broader approach
        if not results:
            # Look for any links that might be content
            links = soup.find_all('a', href=re.compile(r'/((?!page)[\w\-])+/'))
            for link in links:
                try:
                    href = link.get('href')
                    text = link.get_text().strip()
                    
                    # Skip navigation and utility links
                    if any(skip_word in text.lower() for skip_word in ['page', 'next', 'prev', 'berikut', 'sebelum']):
                        continue
                        
                    # Only include links that look like content
                    if href and ('/tv/' in href or '/eps/' in href or re.match(r'^https?://[^/]+/[\w\-]+/$', href)):
                        # Make absolute URL
                        if href.startswith('/'):
                            href = urljoin("https://new17.ngefilm.site", href)
                        elif not href.startswith('http'):
                            href = urljoin("https://new17.ngefilm.site", href)
                        
                        # Only add if it's not already in results
                        if href not in [r['url'] for r in results]:
                            results.append({
                                'title': text or "Untitled",
                                'url': href,
                                'image_url': '',
                                'rating': '',
                                'type': 'Series' if '/tv/' in href else 'Movie'
                            })
                            
                except Exception as e:
                    continue
        
        return {
            'query': query,
            'results': results,
            'total_results': len(results)
        }
        
    except Exception as e:
        return {"error": f"Search failed: {str(e)}"}

def get_latest_uploads():
    """
    Get latest uploads from the main page
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Get the main page
        response = requests.get("https://new18.ngefilm.site/", headers=headers, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the "Upload Terbaru" section
        latest_items = []
        
        # Look for content items under the "Upload Terbaru" heading
        homemodule_title = soup.find('h3', class_='homemodule-title', string='Upload Terbaru')
        if homemodule_title:
            # Find the container with latest uploads (usually the next sibling or in the main content area)
            grid_container = soup.find('div', id='gmr-main-load')
            if grid_container:
                articles = grid_container.find_all('article', class_='item-infinite')
                
                for article in articles[:20]:  # Get first 20 latest items
                    try:
                        # Extract title
                        title_element = article.find('h2', class_='entry-title')
                        title = ""
                        if title_element:
                            title_link = title_element.find('a')
                            if title_link:
                                title = title_link.get_text().strip()
                        
                        # Extract URL
                        url = ""
                        if title_element:
                            title_link = title_element.find('a', href=True)
                            if title_link:
                                url = title_link.get('href')
                        
                        # Extract image
                        image_url = ""
                        img_element = article.find('img')
                        if img_element:
                            image_url = img_element.get('data-src') or img_element.get('src')
                        
                        # Extract rating
                        rating = ""
                        rating_element = article.find(class_='gmr-rating-item')
                        if rating_element:
                            rating_text = rating_element.get_text().strip()
                            # Extract numeric rating if possible
                            rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                            if rating_match:
                                rating = rating_match.group(1)
                        
                        # Extract year from title or date
                        year = ""
                        # Try to find year in the title
                        year_match = re.search(r'(?:\(|-|,)\s*(20\d{2}|19\d{2})\s*[\)\]-]?', title)
                        if year_match:
                            year = year_match.group(1)
                        else:
                            # Try to find year in dateCreated element
                            date_element = article.find('time', class_='screen-reader-text')
                            if date_element and date_element.get('datetime'):
                                year = date_element.get('datetime')[:4]
                        
                        # Determine if it's a series or movie
                        type_indicator = "Movie"
                        if any(keyword in title.lower() for keyword in ['season', 'episode', 'eps', 'series']):
                            type_indicator = "Series"
                        elif '/tv/' in url or '/series/' in url:
                            type_indicator = "Series"
                        
                        if title and url:
                            latest_items.append({
                                'title': title,
                                'url': url,
                                'image_url': image_url,
                                'rating': rating,
                                'year': year,
                                'type': type_indicator
                            })
                    except Exception as e:
                        print(f"Error processing latest upload item: {e}")
                        continue
        
        return {
            'section_title': 'Upload Terbaru',
            'items': latest_items,
            'total_items': len(latest_items)
        }
        
    except Exception as e:
        return {"error": f"Failed to get latest uploads: {str(e)}"}

def extract_series_episodes(series_url, soup, headers, title):
    """
    Extract episode URLs and their player information from a series page
    """
    # Find episode links
    episode_elements = soup.find_all('div', class_='gmr-listseries')
    episodes = []
    
    if episode_elements:
        episode_links = episode_elements[0].find_all('a', href=True)
        for link in episode_links:
            href = link.get('href')
            text = link.get_text().strip()
            
            # Skip the "Pilih Episode" link
            if 'pilih episode' in text.lower() or 'choose episode' in text.lower():
                continue
                
            # Only include actual episode links
            if '/eps/' in href and ('eps' in text.lower() or 'episode' in text.lower() or re.match(r'Eps\d+', text)):
                # Make absolute URL if needed
                if href.startswith('/'):
                    href = urljoin(series_url, href)
                elif not href.startswith('http'):
                    href = urljoin(series_url, href)
                
                episodes.append({
                    'title': text,
                    'url': href
                })
    
    # If we didn't find episodes in gmr-listseries, look for them elsewhere
    if not episodes:
        # Look for episode links more broadly
        all_links = soup.find_all('a', href=True)
        for link in all_links:
            href = link.get('href')
            text = link.get_text().strip()
            
            if '/eps/' in href and ('eps' in text.lower() or 'episode' in text.lower() or re.match(r'Eps\d+', text)):
                # Make absolute URL
                if href.startswith('/'):
                    href = urljoin(series_url, href)
                elif not href.startswith('http'):
                    href = urljoin(series_url, href)
                
                # Avoid duplicates
                if href not in [e['url'] for e in episodes]:
                    episodes.append({
                        'title': text,
                        'url': href
                    })
    
    # Limit to first 20 episodes for performance
    episodes = episodes[:20]
    
    # Extract player URLs for first few episodes
    episode_data = []
    
    for episode in episodes[:8]:  # Process first 8 episodes fully
        try:
            episode_response = requests.get(episode['url'], headers=headers, timeout=30)
            episode_response.raise_for_status()
            episode_soup = BeautifulSoup(episode_response.content, 'html.parser')
            
            # Extract player URLs for this episode (Server 1 through Server 6)
            players = []
            for i in range(1, 7):
                if i == 1:
                    player_url = episode['url']  # Server 1 is the main episode page
                else:
                    if '?' in episode['url']:
                        player_url = f"{episode['url']}&player={i}"
                    else:
                        player_url = f"{episode['url']}?player={i}"
                
                # Extract iframe URL from player page
                try:
                    player_page_response = requests.get(player_url, headers=headers, timeout=30)
                    player_page_response.raise_for_status()
                    player_page_soup = BeautifulSoup(player_page_response.content, 'html.parser')
                    
                    # Look for iframe with data-litespeed-src or src
                    iframe = player_page_soup.find('iframe')
                    iframe_url = ""
                    if iframe:
                        iframe_url = iframe.get('data-litespeed-src') or iframe.get('src')
                        if iframe_url == 'about:blank':
                            iframe_url = ""
                    
                    players.append({
                        'server_name': f"Server {i}",
                        'player_page_url': player_url,
                        'iframe_url': iframe_url or "",
                        'type': 'Stream'
                    })
                    
                    # Small delay to be respectful
                    time.sleep(0.1)
                    
                except Exception as e:
                    players.append({
                        'server_name': f"Server {i}",
                        'player_page_url': player_url,
                        'iframe_url': "",
                        'error': str(e),
                        'type': 'Stream'
                    })
            
            episode_data.append({
                'title': episode['title'],
                'url': episode['url'],
                'players': players
            })
            
            # Small delay between episodes
            time.sleep(0.2)
            
        except Exception as e:
            episode_data.append({
                'title': episode['title'],
                'url': episode['url'],
                'error': str(e),
                'players': []
            })
    
    # For remaining episodes, just include basic info
    for episode in episodes[8:]:
        episode_data.append({
            'title': episode['title'],
            'url': episode['url'],
            'players': []  # Will be populated when user selects this episode
        })
    
    return {
        'title': title,
        'url': series_url,
        'type': 'series',
        'episodes': episode_data,
        'total_episodes': len(episodes)
    }

def extract_movie_players(movie_url, soup, headers, title):
    """
    Extract player URLs for a movie
    """
    # Find player tabs
    player_tabs = soup.find('ul', class_='muvipro-player-tabs')
    player_urls = []
    
    if player_tabs:
        # Extract all player links
        links = player_tabs.find_all('a', href=True)
        for i, link in enumerate(links):
            player_url = link['href']
            server_name = link.get_text().strip() or f"Server {i+1}"
            
            # Make absolute URL if needed
            if player_url.startswith('/'):
                player_url = urljoin(movie_url, player_url)
            elif not player_url.startswith('http'):
                player_url = urljoin(movie_url, player_url)
            
            player_urls.append({
                'server_name': server_name,
                'player_page_url': player_url
            })
    else:
        # If no player tabs found, try common player URL patterns
        for i in range(1, 7):
            player_url = f"{movie_url}?player={i}" if '?' not in movie_url else f"{movie_url}&player={i}"
            player_urls.append({
                'server_name': f"Server {i}",
                'player_page_url': player_url
            })
    
    # Extract iframe URLs from each player page
    all_players = []
    
    for player_info in player_urls:
        try:
            player_response = requests.get(player_info['player_page_url'], headers=headers, timeout=30)
            player_response.raise_for_status()
            player_soup = BeautifulSoup(player_response.content, 'html.parser')
            
            # Look for iframe with data-litespeed-src or src
            iframe = player_soup.find('iframe')
            iframe_url = ""
            if iframe:
                iframe_url = iframe.get('data-litespeed-src') or iframe.get('src')
                if iframe_url == 'about:blank':
                    iframe_url = ""
            
            all_players.append({
                'server_name': player_info['server_name'],
                'player_page_url': player_info['player_page_url'],
                'iframe_url': iframe_url or "",
                'type': 'Stream'
            })
            
            # Small delay to be respectful
            time.sleep(0.2)
            
        except Exception as e:
            all_players.append({
                'server_name': player_info['server_name'],
                'player_page_url': player_info['player_page_url'],
                'iframe_url': '',
                'error': str(e),
                'type': 'Stream'
            })
    
    return {
        'title': title,
        'url': movie_url,
        'type': 'movie',
        'players': all_players
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/extract', methods=['POST'])
def extract_api():
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({"error": "URL is required"}), 400
        
        # Extract player URLs
        result = extract_player_urls(url)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/search', methods=['POST'])
def search_api():
    try:
        data = request.get_json()
        query = data.get('query')
        content_type = data.get('type', None)  # 'movie', 'tv', or None for both
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        # Perform search
        result = search_movies_series(query, content_type)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"Search error: {str(e)}"}), 500

@app.route('/api/latest', methods=['GET'])
def latest_api():
    try:
        # Get latest uploads
        result = get_latest_uploads()
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)