// --- Konfigurasi API TMDB ---
const apiKey = 'bd7f7c2373a157c90b6d8585680b194c';

const apiEndpoints = {
    trendingMovies: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=id-ID`,
    horrorMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&with_genres=27&sort_by=popularity.desc`,
    trendingTv: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=id-ID`,
    upcomingMovies: `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=id-ID&page=1`,
    // Endpoint untuk film olahraga. ID kata kunci: 9715 (sport), 18 (sports drama)
    sportsMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&sort_by=popularity.desc&with_genres=18&with_keywords=9715`,
    search: `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=id-ID&query=`
};

const imageBaseUrl = 'https://image.tmdb.org/t/p/';

// --- Fungsi Generik untuk Membuat Kartu Media ---
const createMediaCard = (item) => {
    if (!item.poster_path) return null;

    const cardLink = document.createElement('a');
    cardLink.className = 'card';
    
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    
    if (mediaType === 'person') return null;
    
    cardLink.href = `player.html?id=${item.id}&type=${mediaType}&title=${encodeURIComponent(item.title || item.name)}`;

    const cardImg = document.createElement('img');
    cardImg.className = 'card-img';
    cardImg.src = `${imageBaseUrl}w500${item.poster_path}`;

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const title = document.createElement('h2');
    title.className = 'name';
    title.textContent = item.title || item.name;

    const description = document.createElement('h6');
    description.className = 'des';
    description.textContent = item.release_date ? `Rilis: ${item.release_date}` : `Rating: ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}`;

    const watchlistBtn = document.createElement('button');
    watchlistBtn.className = 'watchlist-btn';
    watchlistBtn.textContent = 'Info Lebih Lanjut';
    
    watchlistBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Info untuk: ${item.title || item.name}`);
    });

    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(watchlistBtn);

    cardLink.appendChild(cardImg);
    cardLink.appendChild(cardBody);
    
    return cardLink;
};

// --- Fungsi untuk Mengambil Data ---
const fetchAndBuildCarousel = async (container) => {
    try {
        const response = await fetch(apiEndpoints.trendingMovies);
        const data = await response.json();
        data.results.slice(0, 5).forEach(movie => {
            const slide = document.createElement('div');
            slide.className = 'slider';
            const imgElement = document.createElement('img');
            imgElement.src = `${imageBaseUrl}w1280${movie.backdrop_path}`;
            const content = document.createElement('div');
            content.className = 'slide-content';
            const h1 = document.createElement('h1');
            h1.className = 'movie-title';
            h1.textContent = movie.title;
            const p = document.createElement('p');
            p.className = 'movie-des';
            p.textContent = movie.overview;
            content.appendChild(h1);
            content.appendChild(p);
            slide.appendChild(content);
            slide.appendChild(imgElement);
            container.appendChild(slide);
        });
    } catch (error) {
        console.error('Gagal memuat korsel:', error);
    }
};

const fetchAndBuildSection = async (endpoint, container) => {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        
        // Hapus penampung kartu jika sudah ada isinya
        while(container.firstChild) {
            container.removeChild(container.firstChild);
        }

        data.results.forEach(item => {
            const card = createMediaCard(item);
            if (card) {
                container.appendChild(card);
            }
        });
    } catch (error) {
        console.error(`Gagal memuat data dari ${endpoint}:`, error);
    }
};

// --- LOGIKA UTAMA ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Logika Deteksi Halaman ---
    const carouselContainer = document.querySelector('.carousel');
    const upcomingGridContainer = document.getElementById('upcoming-movies-grid');
    const playerContainer = document.getElementById('player-container');
    const sportsGridContainer = document.getElementById('sports-movies-grid'); // Deteksi halaman olahraga

    if (carouselContainer) { // Halaman Utama
        const horrorListContainer = document.getElementById('horror-list');
        const trendingTvListContainer = document.getElementById('trending-tv-list');
        fetchAndBuildCarousel(carouselContainer);
        fetchAndBuildSection(apiEndpoints.horrorMovies, horrorListContainer);
        fetchAndBuildSection(apiEndpoints.trendingTv, trendingTvListContainer);
    } 
    else if (upcomingGridContainer) { // Halaman Film
        fetchAndBuildSection(apiEndpoints.upcomingMovies, upcomingGridContainer);
    }
    else if (sportsGridContainer) { // Halaman Olahraga
        fetchAndBuildSection(apiEndpoints.sportsMovies, sportsGridContainer);
    }
    else if (playerContainer) { // Halaman Player
        const params = new URLSearchParams(window.location.search);
        const mediaId = params.get('id');
        const mediaType = params.get('type');
        const mediaTitle = params.get('title');
        const titleElement = document.getElementById('movie-player-title');
        if (mediaId && mediaType) {
            titleElement.textContent = mediaTitle || "Memuat film...";
            document.title = `Nonton ${mediaTitle || 'Film'} - kingmovie-nobar gratis`;
            const embedUrl = `https://vidfast.pro/movie/${mediaId}`;
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('frameborder', '0');
            playerContainer.appendChild(iframe);
        } else {
            titleElement.textContent = "Error: Film tidak dapat dimuat";
            playerContainer.innerHTML = '<p>Parameter tidak lengkap.</p>';
        }
    }

    // --- LOGIKA PENCARIAN REAL-TIME ---
    const searchBox = document.querySelector('.search-box');
    const mainContainers = [
        document.querySelector('.carousel-container'),
        ...document.querySelectorAll('.video-card-container'),
        document.querySelector('.main-content')
    ].filter(el => el != null);

    let searchResultsWrapper;
    let debounceTimeout;

    const handleSearch = async (query) => {
        if (!searchResultsWrapper) {
            searchResultsWrapper = document.createElement('div');
            searchResultsWrapper.className = 'main-content';
            searchResultsWrapper.id = 'search-results-wrapper';
            document.body.insertBefore(searchResultsWrapper, document.querySelector('nav').nextSibling);
        }

        if (!query) {
            mainContainers.forEach(container => container.style.display = '');
            searchResultsWrapper.style.display = 'none';
            searchResultsWrapper.innerHTML = '';
            return;
        }

        mainContainers.forEach(container => container.style.display = 'none');
        searchResultsWrapper.style.display = 'block';

        try {
            const response = await fetch(`${apiEndpoints.search}${encodeURIComponent(query)}`);
            const data = await response.json();
            
            searchResultsWrapper.innerHTML = '';

            const title = document.createElement('h1');
            title.textContent = `Hasil Pencarian untuk "${query}"`;
            searchResultsWrapper.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'movie-grid';

            const validResults = data.results.filter(item => item.media_type !== 'person' && item.poster_path);

            if (validResults.length > 0) {
                validResults.forEach(item => {
                    const card = createMediaCard(item);
                    if (card) grid.appendChild(card);
                });
            } else {
                grid.innerHTML = '<p>Tidak ada hasil yang ditemukan.</p>';
            }
            
            searchResultsWrapper.appendChild(grid);

        } catch (error) {
            console.error('Gagal melakukan pencarian:', error);
            searchResultsWrapper.innerHTML = '<h1>Error</h1><p>Gagal memuat hasil pencarian.</p>';
        }
    };

    searchBox.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        const query = e.target.value.trim();
        debounceTimeout = setTimeout(() => {
            handleSearch(query);
        }, 500);
    });
});
