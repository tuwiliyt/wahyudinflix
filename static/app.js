// App.js - Main Application Logic

class VideoPlayerExtractor {
    constructor() {
        this.videoUrl = '';
        this.extractedData = null;
        this.init();
    }

    init() {
        // DOM Elements
        this.videoUrlInput = document.getElementById('videoUrl');
        this.extractBtn = document.getElementById('extractBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.clearSearchBtn = document.getElementById('clearSearchBtn');
        this.loadingSection = document.getElementById('loadingSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.searchResultsSection = document.getElementById('searchResults');
        this.errorSection = document.getElementById('errorSection');
        this.errorMessage = document.getElementById('errorMessage');
        this.videoTitle = document.getElementById('videoTitle');
        this.videoUrlDisplay = document.getElementById('videoUrlDisplay');
        this.episodeInfo = document.getElementById('episodeInfo');
        this.playerCount = document.getElementById('playerCount');
        this.playersTab = document.getElementById('playersTab');
        this.playersTabContent = document.getElementById('playersTabContent');
        this.searchResultsList = document.getElementById('searchResultsList');

        // Event Listeners
        this.extractBtn.addEventListener('click', () => this.extractPlayers());
        this.refreshBtn.addEventListener('click', () => this.extractPlayers());
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.clearSearchBtn.addEventListener('click', () => this.clearSearchResults());
        
        this.videoUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.extractPlayers();
            }
        });
        
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Load sample URL for demo
        this.videoUrlInput.value = 'https://new17.ngefilm.site/ice-road-vengeance-2025/';
        this.searchInput.placeholder = 'e.g., Wednesday, Ice Road, Peacemaker...';
    }

    async extractPlayers() {
        this.videoUrl = this.videoUrlInput.value.trim();
        
        if (!this.videoUrl) {
            this.showError('Please enter a valid URL');
            return;
        }

        try {
            // Show loading state
            this.showLoading();
            
            // Call the backend API
            const response = await fetch('/api/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: this.videoUrl })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process and display results
            this.extractedData = data;
            this.displayResults(data);
            
        } catch (error) {
            this.showError(error.message || 'Failed to extract players');
        }
    }

    async performSearch() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            this.showError('Please enter a search term');
            return;
        }

        try {
            // Show loading state
            this.showLoading();
            
            // Call the search API
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process and display search results
            this.displaySearchResults(data);
            
        } catch (error) {
            this.showError(error.message || 'Failed to perform search');
        }
    }

    showLoading() {
        this.hideAllSections();
        this.loadingSection.classList.remove('d-none');
    }

    hideAllSections() {
        this.loadingSection.classList.add('d-none');
        this.resultsSection.classList.add('d-none');
        this.searchResultsSection.classList.add('d-none');
        this.errorSection.classList.add('d-none');
    }

    showError(message) {
        this.hideAllSections();
        this.errorMessage.textContent = message;
        this.errorSection.classList.remove('d-none');
    }

    displayResults(data) {
        this.hideAllSections();
        
        // Check if there was an error
        if (data.error) {
            this.showError(data.error);
            return;
        }
        
        // Update video info
        this.videoTitle.textContent = data.title || 'Unknown Title';
        this.videoUrlDisplay.textContent = data.url || this.videoUrl;
        
        if (data.type === 'series') {
            // Handle series data
            this.displaySeriesResults(data);
        } else {
            // Handle movie data
            this.displayMovieResults(data);
        }
        
        // Show results
        this.resultsSection.classList.remove('d-none');
    }

    displaySearchResults(data) {
        this.hideAllSections();
        
        // Check if there was an error
        if (data.error) {
            this.showError(data.error);
            return;
        }
        
        // Clear existing search results
        this.searchResultsList.innerHTML = '';
        
        // Check if we have results
        if (!data.results || data.results.length === 0) {
            this.searchResultsList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <h5><i class="bi bi-info-circle"></i> No results found</h5>
                        <p>We couldn't find any movies or series matching "<strong>${data.query}</strong>". Try a different search term.</p>
                    </div>
                </div>
            `;
            this.searchResultsSection.classList.remove('d-none');
            return;
        }
        
        // Display search results
        data.results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'col-md-6 col-lg-4 mb-4';
            resultItem.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${result.title}</h5>
                        <div class="mb-2">
                            <span class="badge bg-${result.type === 'Series' ? 'warning' : 'primary'}">${result.type}</span>
                            ${result.rating ? `<span class="badge bg-success ms-2">${result.rating}</span>` : ''}
                        </div>
                        ${result.image_url ? `
                            <div class="mb-3">
                                <img src="${result.image_url}" class="card-img-top" alt="${result.title}" style="height: 200px; object-fit: cover;" loading="lazy">
                            </div>
                        ` : ''}
                        <p class="card-text flex-grow-1">
                            <small class="text-muted">${result.url}</small>
                        </p>
                        <button class="btn btn-primary mt-auto load-content-btn" data-url="${result.url}">
                            <i class="bi bi-play-circle"></i> Load Players
                        </button>
                    </div>
                </div>
            `;
            
            this.searchResultsList.appendChild(resultItem);
            
            // Add event listener to the load button
            const loadBtn = resultItem.querySelector('.load-content-btn');
            loadBtn.addEventListener('click', () => {
                this.videoUrlInput.value = result.url;
                this.extractPlayers();
            });
        });
        
        // Show search results
        this.searchResultsSection.classList.remove('d-none');
    }

    clearSearchResults() {
        this.searchResultsSection.classList.add('d-none');
        this.searchInput.value = '';
        this.searchInput.focus();
    }

    displaySeriesResults(data) {
        // Update episode info
        const episodeCount = data.total_episodes || (data.episodes ? data.episodes.length : 0);
        this.episodeInfo.textContent = `Series (${episodeCount} episodes)`;
        this.episodeInfo.classList.remove('d-none');
        
        // Update player count
        const playerCount = data.episodes ? data.episodes.reduce((count, episode) => count + (episode.players ? episode.players.length : 0), 0) : 0;
        this.playerCount.textContent = `${playerCount} Players Available`;
        
        // Generate tabs for episodes
        this.generateSeriesTabs(data);
    }

    displayMovieResults(data) {
        // Hide episode info for movies
        this.episodeInfo.classList.add('d-none');
        
        // Update player count
        this.playerCount.textContent = `${data.players.length} Players Available`;
        
        // Generate tabs for movie players
        this.generateMovieTabs(data.players);
    }

    generateSeriesTabs(data) {
        // Clear existing tabs and content
        this.playersTab.innerHTML = '';
        this.playersTabContent.innerHTML = '';
        
        // Check if we have episodes
        if (!data.episodes || data.episodes.length === 0) {
            this.playersTabContent.innerHTML = `
                <div class="alert alert-info mt-3">
                    <h5><i class="bi bi-info-circle"></i> No episodes available</h5>
                    <p>No episodes found for this series.</p>
                </div>
            `;
            return;
        }
        
        // Create tabs for episodes
        data.episodes.forEach((episode, index) => {
            const isActive = index === 0;
            
            // Create tab
            const tab = document.createElement('li');
            tab.className = 'nav-item';
            tab.role = 'presentation';
            
            const tabLink = document.createElement('button');
            tabLink.className = `nav-link ${isActive ? 'active' : ''}`;
            tabLink.id = `tab-${index}`;
            tabLink.dataset.bsToggle = 'tab';
            tabLink.dataset.bsTarget = `#episode-${index}`;
            tabLink.type = 'button';
            tabLink.role = 'tab';
            tabLink.textContent = episode.title || `Episode ${index + 1}`;
            
            tab.appendChild(tabLink);
            this.playersTab.appendChild(tab);
            
            // Create tab content
            const tabContent = document.createElement('div');
            tabContent.className = `tab-pane fade ${isActive ? 'show active' : ''}`;
            tabContent.id = `episode-${index}`;
            tabContent.role = 'tabpanel';
            
            if (episode.error) {
                tabContent.innerHTML = `
                    <div class="alert alert-danger mt-3">
                        <h5><i class="bi bi-exclamation-triangle"></i> Error loading episode</h5>
                        <p>${episode.error}</p>
                    </div>
                `;
            } else {
                // Create player content for this episode
                const playerContentId = `player-content-${index}`;
                
                // Check if we have player data or need to lazy load it
                if (episode.players && episode.players.length > 0) {
                    tabContent.innerHTML = `
                        <h4 class="mt-3">${episode.title}</h4>
                        <p>${episode.url}</p>
                        <div id="${playerContentId}">
                            <!-- Player tabs will be populated here -->
                        </div>
                    `;
                    
                    // Append to DOM so we can manipulate child elements
                    this.playersTabContent.appendChild(tabContent);
                    
                    // Generate player tabs for this episode
                    this.generateEpisodePlayerContent(episode.players, playerContentId);
                } else {
                    // Need to lazy load player data
                    tabContent.innerHTML = `
                        <h4 class="mt-3">${episode.title}</h4>
                        <p>${episode.url}</p>
                        <div class="text-center mt-4">
                            <button class="btn btn-primary load-players-btn" data-episode-url="${episode.url}" data-episode-index="${index}">
                                <i class="bi bi-play-btn"></i> Load Player Options
                            </button>
                        </div>
                        <div id="${playerContentId}" class="mt-3">
                            <!-- Player content will be loaded here -->
                        </div>
                    `;
                    
                    // Append to DOM
                    this.playersTabContent.appendChild(tabContent);
                    
                    // Add event listener to load button
                    const loadButton = tabContent.querySelector('.load-players-btn');
                    loadButton.addEventListener('click', () => this.loadEpisodePlayers(episode.url, index, playerContentId));
                }
            }
            
            this.playersTabContent.appendChild(tabContent);
        });
    }

    async loadEpisodePlayers(episodeUrl, episodeIndex, contentContainerId) {
        try {
            // Show loading indicator
            const contentContainer = document.getElementById(contentContainerId);
            contentContainer.innerHTML = `
                <div class="text-center mt-3">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading player options...</p>
                </div>
            `;
            
            // Call backend to get player data for this episode
            const response = await fetch('/api/extract-episode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: episodeUrl })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const players = await response.json();
            
            // Generate player content for this episode
            this.generateEpisodePlayerContent(players, contentContainerId);
            
        } catch (error) {
            const contentContainer = document.getElementById(contentContainerId);
            contentContainer.innerHTML = `
                <div class="alert alert-danger mt-3">
                    <h5><i class="bi bi-exclamation-triangle"></i> Error loading players</h5>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    generateEpisodePlayerContent(players, containerId) {
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        if (!players || players.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info mt-3">
                    <h5><i class="bi bi-info-circle"></i> No players available</h5>
                    <p>No streaming options found for this episode.</p>
                </div>
            `;
            return;
        }
        
        // Create player tabs
        const playerTabsId = `${containerId}-tabs`;
        const playerTabsContentId = `${containerId}-content`;
        
        let tabsHtml = '';
        let contentHtml = '';
        
        players.forEach((player, playerIndex) => {
            const isActive = playerIndex === 0;
            
            // Create tab
            tabsHtml += `
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${isActive ? 'active' : ''}" 
                            id="${playerTabsId}-tab-${playerIndex}" 
                            data-bs-toggle="tab" 
                            data-bs-target="#${playerTabsContentId}-player-${playerIndex}" 
                            type="button" 
                            role="tab">
                        ${player.server_name || `Player ${playerIndex + 1}`}
                    </button>
                </li>
            `;
            
            // Create tab content
            if (player.error) {
                contentHtml += `
                    <div class="tab-pane fade ${isActive ? 'show active' : ''}" 
                         id="${playerTabsContentId}-player-${playerIndex}" 
                         role="tabpanel">
                        <div class="alert alert-warning mt-3">
                            <h5><i class="bi bi-exclamation-triangle"></i> Error loading player</h5>
                            <p>${player.error}</p>
                        </div>
                    </div>
                `;
            } else if (player.iframe_url) {
                contentHtml += `
                    <div class="tab-pane fade ${isActive ? 'show active' : ''}" 
                         id="${playerTabsContentId}-player-${playerIndex}" 
                         role="tabpanel">
                        <div class="card mt-3">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h5 class="card-title mb-0">${player.server_name || `Player ${playerIndex + 1}`}</h5>
                                    <div>
                                        <span class="badge bg-info">${player.type || 'Stream'}</span>
                                    </div>
                                </div>
                                
                                <div class="player-container mb-3">
                                    <iframe 
                                        src="${player.iframe_url}" 
                                        class="player-frame"
                                        allowfullscreen
                                        loading="lazy">
                                    </iframe>
                                </div>
                                
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted">
                                        <i class="bi bi-link"></i> ${player.iframe_url}
                                    </small>
                                    <button class="btn btn-outline-primary btn-sm" onclick="copyUrl('${player.iframe_url}')">
                                        <i class="bi bi-clipboard"></i> Copy URL
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                contentHtml += `
                    <div class="tab-pane fade ${isActive ? 'show active' : ''}" 
                         id="${playerTabsContentId}-player-${playerIndex}" 
                         role="tabpanel">
                        <div class="alert alert-info mt-3">
                            <h5><i class="bi bi-info-circle"></i> No player URL available</h5>
                            <p>This player doesn't have a valid URL.</p>
                        </div>
                    </div>
                `;
            }
        });
        
        container.innerHTML = `
            <ul class="nav nav-tabs mt-3" id="${playerTabsId}" role="tablist">
                ${tabsHtml}
            </ul>
            <div class="tab-content" id="${playerTabsContentId}">
                ${contentHtml}
            </div>
        `;
    }

    generateMovieTabs(players) {
        // Clear existing tabs and content
        this.playersTab.innerHTML = '';
        this.playersTabContent.innerHTML = '';
        
        if (!players || players.length === 0) {
            this.playersTabContent.innerHTML = `
                <div class="alert alert-info mt-3">
                    <h5><i class="bi bi-info-circle"></i> No players available</h5>
                    <p>No streaming options found for this movie.</p>
                </div>
            `;
            return;
        }
        
        // Create tabs and content for each player
        players.forEach((player, index) => {
            const isActive = index === 0;
            
            // Create tab
            const tab = document.createElement('li');
            tab.className = 'nav-item';
            tab.role = 'presentation';
            
            const tabLink = document.createElement('button');
            tabLink.className = `nav-link ${isActive ? 'active' : ''}`;
            tabLink.id = `tab-${index}`;
            tabLink.dataset.bsToggle = 'tab';
            tabLink.dataset.bsTarget = `#player-${index}`;
            tabLink.type = 'button';
            tabLink.role = 'tab';
            tabLink.innerHTML = `
                <i class="bi bi-play-circle"></i> ${player.server_name}
                ${player.quality ? `<span class="badge bg-secondary ms-2">${player.quality}</span>` : ''}
            `;
            
            tab.appendChild(tabLink);
            this.playersTab.appendChild(tab);
            
            // Create tab content
            const tabContent = document.createElement('div');
            tabContent.className = `tab-pane fade ${isActive ? 'show active' : ''}`;
            tabContent.id = `player-${index}`;
            tabContent.role = 'tabpanel';
            
            if (player.error) {
                tabContent.innerHTML = `
                    <div class="alert alert-warning mt-3">
                        <h5><i class="bi bi-exclamation-triangle"></i> Error loading player</h5>
                        <p>${player.error}</p>
                    </div>
                `;
            } else if (player.iframe_url) {
                tabContent.innerHTML = `
                    <div class="card mt-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title mb-0">${player.server_name}</h5>
                                <div>
                                    <span class="badge bg-info">${player.type || 'Stream'}</span>
                                    ${player.quality ? `<span class="badge bg-success ms-2">${player.quality}</span>` : ''}
                                </div>
                            </div>
                            
                            <div class="player-container mb-3">
                                <iframe 
                                    src="${player.iframe_url}" 
                                    class="player-frame"
                                    allowfullscreen
                                    loading="lazy">
                                </iframe>
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="bi bi-link"></i> ${player.iframe_url}
                                </small>
                                <button class="btn btn-outline-primary btn-sm" onclick="copyUrl('${player.iframe_url}')">
                                    <i class="bi bi-clipboard"></i> Copy URL
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                tabContent.innerHTML = `
                    <div class="alert alert-info mt-3">
                        <h5><i class="bi bi-info-circle"></i> No player URL available</h5>
                        <p>This player doesn't have a valid URL.</p>
                    </div>
                `;
            }
            
            this.playersTabContent.appendChild(tabContent);
        });
    }
}

// Utility function to copy URL to clipboard
function copyUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        // Show feedback
        const originalText = event.target.innerHTML;
        event.target.innerHTML = '<i class="bi bi-check"></i> Copied!';
        setTimeout(() => {
            event.target.innerHTML = originalText;
        }, 2000);
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VideoPlayerExtractor();
});