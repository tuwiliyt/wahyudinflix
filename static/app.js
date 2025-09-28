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
        this.refreshLatestBtn = document.getElementById('refreshLatestBtn');
        this.latestUploadsSection = document.getElementById('latestUploadsSection');
        this.latestUploadsList = document.getElementById('latestUploadsList');
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
        this.refreshLatestBtn.addEventListener('click', () => this.loadLatestUploads());
        
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
        
        // Load latest uploads on initialization
        setTimeout(() => {
            this.loadLatestUploads();
            // Load hero carousel with latest uploads
            this.loadHeroCarousel();
        }, 500); // Small delay to ensure DOM is fully loaded
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
            
            // Scroll to loading section immediately so users can see the loading process
            setTimeout(() => {
                document.getElementById('loadingSection').scrollIntoView({ behavior: 'smooth' });
            }, 100); // Small delay to ensure the loading section is visible first
            
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
            
            // Scroll to results section after displaying results
            setTimeout(() => {
                document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
            }, 100); // Small delay to ensure content is rendered
            
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
            
            // Scroll to loading section immediately so users can see the loading process
            setTimeout(() => {
                document.getElementById('loadingSection').scrollIntoView({ behavior: 'smooth' });
            }, 100); // Small delay to ensure the loading section is visible first
            
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
            
            // Scroll to search results section after displaying results
            setTimeout(() => {
                document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
            }, 100); // Small delay to ensure content is rendered
            
        } catch (error) {
            this.showError(error.message || 'Failed to perform search');
        }
    }

    async loadLatestUploads() {
        try {
            // Show loading state for latest uploads
            this.latestUploadsList.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Memuat upload terbaru...</p>
                    </div>
                </div>
            `;
            
            // Call the latest uploads API
            const response = await fetch('/api/latest', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process and display latest uploads
            this.displayLatestUploads(data);
            
        } catch (error) {
            this.latestUploadsList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <h5><i class="bi bi-exclamation-triangle"></i> Error Loading Latest Uploads</h5>
                        <p>${error.message || 'Failed to load latest uploads'}</p>
                    </div>
                </div>
            `;
        }
    }

    async loadHeroCarousel() {
        try {
            // Call the latest uploads API to get data for hero carousel
            const response = await fetch('/api/latest', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process and display hero carousel
            this.displayHeroCarousel(data);
            
        } catch (error) {
            document.getElementById('heroCarousel').innerHTML = `
                <div class="hero-placeholder d-flex align-items-center justify-content-center" style="height: 500px;">
                    <div class="text-center">
                        <h4 class="text-light">Error loading featured content</h4>
                        <p class="text-light">${error.message || 'Failed to load latest uploads'}</p>
                    </div>
                </div>
            `;
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
            resultItem.className = 'col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2 mb-4';
            resultItem.innerHTML = `
                <div class="movie-card">
                    <div class="poster-container">
            <img src="${result.image_url || 'https://placehold.co/200x300?text=No+Image'}" alt="${result.title}" loading="lazy">
        </div>
                    <div class="card-body">
                        <h5 class="card-title" title="${result.title}">${result.title.length > 30 ? result.title.substring(0, 30) + '...' : result.title}</h5>
                        <div class="movie-meta">
                            <span class="badge bg-${result.type === 'Series' ? 'warning' : 'danger'}">${result.type}</span>
                            ${result.rating ? `<span class="badge bg-success">${result.rating}</span>` : ''}
                        </div>
                        <button class="btn btn-danger load-content-btn" data-url="${result.url}">
                            <i class="bi bi-play-circle"></i> Play
                        </button>
                    </div>
                </div>
            `;
            
            this.searchResultsList.appendChild(resultItem);
            
            // Add event listener to the load button
            const loadBtn = resultItem.querySelector('.load-content-btn');
            loadBtn.addEventListener('click', () => {
                this.videoUrlInput.value = result.url;
                this.extractPlayers(); // This will handle scrolling internally
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

    displayHeroCarousel(data) {
        // Check if there was an error
        if (data.error) {
            document.getElementById('heroCarousel').innerHTML = `
                <div class="hero-placeholder d-flex align-items-center justify-content-center" style="height: 500px;">
                    <div class="text-center">
                        <h4 class="text-light">Error loading featured content</h4>
                        <p class="text-light">${data.error}</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Check if we have items
        if (!data.items || data.items.length === 0) {
            document.getElementById('heroCarousel').innerHTML = `
                <div class="hero-placeholder d-flex align-items-center justify-content-center" style="height: 500px;">
                    <div class="text-center">
                        <h4 class="text-light">No featured content available</h4>
                        <p class="text-light">Check back later for new releases</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Use the first 5 items for the hero carousel
        const heroItems = data.items.slice(0, 5);
        
        let carouselInnerHtml = '';
        let carouselIndicatorsHtml = '';
        
        heroItems.forEach((item, index) => {
            const isActive = index === 0 ? 'active' : '';
            
            carouselIndicatorsHtml += `
                <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="${index}" class="${isActive}" aria-label="Slide ${index + 1}"></button>
            `;
            
            carouselInnerHtml += `
                <div class="carousel-item ${isActive}">
                    <img src="${item.image_url || 'https://placehold.co/1200x500?text=No+Image'}" alt="${item.title}">
                    <div class="carousel-caption">
                        <div class="hero-meta">
                            <span class="badge bg-danger">${item.type}</span>
                            ${item.rating ? `<span class="badge bg-success">${item.rating}</span>` : ''}
                            ${item.year ? `<span class="badge bg-secondary">${item.year}</span>` : ''}
                        </div>
                        <h3>${item.title}</h3>
                        <p>${item.title} is now available to watch. Experience the latest entertainment right here.</p>
                        <button class="btn btn-danger btn-lg load-content-btn" data-url="${item.url}">
                            <i class="bi bi-play-circle"></i> Watch Now
                        </button>
                    </div>
                </div>
            `;
        });
        
        document.querySelector('#heroCarousel .carousel-inner').innerHTML = carouselInnerHtml;
        document.querySelector('#heroCarousel .carousel-indicators').innerHTML = carouselIndicatorsHtml;
        
        // Add event listeners to the watch now buttons
        const watchButtons = document.querySelectorAll('#heroCarousel .load-content-btn');
        watchButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.videoUrlInput.value = button.getAttribute('data-url');
                this.extractPlayers(); // This will handle scrolling internally
            });
        });
    }

    displayLatestUploads(data) {
        // Check if there was an error
        if (data.error) {
            this.latestUploadsList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <h5><i class="bi bi-exclamation-triangle"></i> Error Loading Latest Uploads</h5>
                        <p>${data.error}</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Check if we have items
        if (!data.items || data.items.length === 0) {
            this.latestUploadsList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <h5><i class="bi bi-info-circle"></i> No latest uploads found</h5>
                        <p>There are no recent uploads to display.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Display latest uploads
        let html = '';
        
        data.items.forEach((item, index) => {
            html += `
                <div class="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2 mb-4">
                    <div class="movie-card">
                        <div class="poster-container">
                            <img src="${item.image_url || 'https://placehold.co/200x300?text=No+Image'}" alt="${item.title}" loading="lazy">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title" title="${item.title}">${item.title.length > 30 ? item.title.substring(0, 30) + '...' : item.title}</h5>
                            <div class="movie-meta">
                                <span class="badge bg-${item.type === 'Series' ? 'warning' : 'danger'}">${item.type}</span>
                                ${item.rating ? `<span class="badge bg-success">${item.rating}</span>` : ''}
                                ${item.year ? `<span class="badge bg-secondary">${item.year}</span>` : ''}
                            </div>
                            <button class="btn btn-danger load-content-btn" data-url="${item.url}">
                                <i class="bi bi-play-circle"></i> Play
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        this.latestUploadsList.innerHTML = html;
        
        // Add event listeners to the load buttons
        const loadButtons = this.latestUploadsList.querySelectorAll('.load-content-btn');
        loadButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.videoUrlInput.value = button.getAttribute('data-url');
                this.extractPlayers(); // This will handle scrolling internally
            });
        });
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
                        <div class="mt-3">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="h5 mb-0">${player.server_name || `Player ${playerIndex + 1}`}</h5>
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
                                <button class="btn btn-outline-danger btn-sm" onclick="copyUrl('${player.iframe_url}')">
                                    <i class="bi bi-clipboard"></i> Copy URL
                                </button>
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
                    <div class="mt-3">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="h5 mb-0">${player.server_name}</h5>
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
                            <button class="btn btn-outline-danger btn-sm" onclick="copyUrl('${player.iframe_url}')">
                                <i class="bi bi-clipboard"></i> Copy URL
                            </button>
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
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy URL: ' + url);
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VideoPlayerExtractor();
});