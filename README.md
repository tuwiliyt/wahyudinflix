# Video Player Extractor Web Application

A web application that extracts video player URLs from movie and series websites and displays them in embedded players.

## Features

- Extract player URLs from movie and series episode pages
- Display all available streaming options in embedded players
- Responsive design that works on desktop and mobile devices
- Copy player URLs to clipboard with one click
- Modern, user-friendly interface

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd video-player-extractor
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

3. Enter the URL of a movie or series episode in the input field.

4. Click "Extract Players" to fetch all available streaming options.

5. Switch between different player servers using the tabs.

6. Click "Copy URL" to copy a player URL to your clipboard.

## How It Works

1. The user enters a video URL (movie or series episode)
2. The Flask backend fetches the page and parses it to find player URLs
3. For each server, the backend extracts the iframe URL for embedding
4. The frontend displays each player in a separate tab with an embedded iframe
5. Users can switch between servers and copy URLs as needed

## Supported Sites

This application is designed to work with sites that follow a similar structure to the example sites. You may need to modify the parsing logic for other sites.

## Technologies Used

- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript
- **Backend**: Python, Flask, BeautifulSoup4, Requests
- **API**: RESTful API for communication between frontend and backend

## Development

To modify the application:

1. Frontend files: `templates/index.html`, `static/styles.css`, `static/app.js`
2. Backend logic: `app.py`
3. Dependencies: `requirements.txt`

## License

This project is for educational purposes only. Please respect the terms of service of the websites you interact with.