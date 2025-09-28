# WAHYUDIN-FLIX - Netflix-Style Video Player Extractor

A Netflix-style web application that extracts video player URLs from movie and series websites and displays them in embedded players with a modern, responsive interface.

## Features

- **Netflix-Style UI**: Modern dark theme interface similar to Netflix
- **Hero Carousel**: Featured content slider with latest uploads
- **Latest Uploads Section**: Display of the most recently added content
- **Search Functionality**: Find movies and series by title
- **Player Extraction**: Extract player URLs from movie and series episode pages
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Auto-Scroll**: Automatically navigates to results when clicking play/search
- **Copy URLs**: Copy player URLs to clipboard with one click
- **Custom Favicon**: Branded "W" favicon for brand recognition

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tuwiliyt/wahyudinflix.git
cd wahyudinflix
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Start the Flask server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

3. Browse the hero carousel or latest uploads for featured content

4. Use the search function to find specific movies/series

5. Click "Play" or "Watch Now" buttons to extract players directly

6. Enter a custom URL in the input field to extract players from any supported site

7. Switch between different player servers using the tabs

8. Click "Copy URL" to copy a player URL to your clipboard

## How It Works

1. The application scrapes the latest uploads from `https://new18.ngefilm.site/`
2. The hero carousel features the most recent content
3. When a user clicks play or enters a URL, the backend fetches and parses the page
4. Player URLs are extracted and displayed in embedded iframes
5. The interface automatically scrolls to show the loaded content

## Supported Content

This application is designed to work with the ngefilm.site structure and similar sites. It extracts content from:
- Movie pages
- TV series episodes
- Multiple player servers per content item

## Technologies Used

- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript, Netflix-style UI
- **Backend**: Python, Flask, BeautifulSoup4, Requests
- **API**: RESTful API for communication between frontend and backend
- **Design**: Responsive CSS with media queries for all screen sizes

## Project Structure

```
wahyudinflix/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies  
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── styles.css        # CSS styling (Netflix-style)
│   ├── app.js            # JavaScript functionality
│   └── images/           # Static assets (favicon)
└── README.md             # Project documentation
```

## Customization

To modify the application:

1. UI styling: Edit `static/styles.css`
2. Frontend behavior: Modify `static/app.js`
3. Backend logic: Update `app.py` 
4. Layout: Change `templates/index.html`

## Deployment

The application can be deployed to platforms like Render, Heroku, or any Python hosting service. Make sure to install dependencies and set up environment variables as needed.

## License

This project is for educational purposes only. Please respect the terms of service of the websites you interact with and use responsibly.

## Contributing

Feel free to fork this repository and submit pull requests for improvements. All contributions are welcome!