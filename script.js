// --- Konfigurasi API TMDB ---
const apiKey = 'bd7f7c2373a157c90b6d8585680b194c';

const apiEndpoints = {
    trendingMovies: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=id-ID`,
    horrorMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&with_genres=27&sort_by=popularity.desc`,
    trendingTv: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=id-ID`,
    popularMovies: `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=id-ID&page=1`,
    sportsMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&sort_by=popularity.desc&with_genres=18&with_keywords=9715`,
    search: `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=id-ID&query=`,
    movieGenres: `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=id-ID`
};

const imageBaseUrl = 'https://image.tmdb.org/t/p/';


// =========================================================================
// BAGIAN FUNGSI-FUNGSI UTAMA (DEFINISI DI LUAR EVENT LISTENER)
// =========================================================================

/**
 * Membuat sebuah elemen kartu untuk film atau serial TV.
 * @param {object} item - Objek data dari TMDB.
 * @returns {HTMLElement|null} - Elemen anchor (<a>) yang berisi kartu, atau null jika tidak valid.
 */
const createMediaCard = (item) => {
    if (!item.poster_path) return null;

    const cardLink = document.createElement('a');
    cardLink.className = 'card';
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    if (mediaType === 'person') return null;
    
    cardLink.href = `player.html?id=${item.id}&type=${mediaType}&title=${encodeURIComponent(item.title || item.name)}`;
    cardLink.innerHTML = `
        <img src="${imageBaseUrl}w500${item.poster_path}" class="card-img" alt="${item.title || item.name}">
        <div class="card-body">
            <h2 class="name">${item.title || item.name}</h2>
            <h6 class="des">${item.release_date ? `Rilis: ${item.release_date}` : `Rating: ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}`}</h6>
            <button class="watchlist-btn">Info Lebih Lanjut</button>
        </div>
    `;
    
    // Mencegah link default dan hanya menampilkan alert
    cardLink.querySelector('.watchlist-btn').addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Info untuk: ${item.title || item.name}`);
    });
    
    return cardLink;
};

/**
 * Mengambil data dari endpoint dan menampilkannya dalam kontainer yang ditentukan.
 * @param {string} endpoint - URL API yang akan di-fetch.
 * @param {HTMLElement} container - Elemen DOM tempat hasil akan ditampilkan.
 */
const fetchAndDisplayMedia = async (endpoint, container) => {
    if (!container) return;
    container.innerHTML = '<p style="text-align: center; width: 100%;">Memuat...</p>';
    
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        container.innerHTML = '';

        if (data.results && data.results.length > 0) {
            data.results.forEach(item => {
                const card = createMediaCard(item);
                if (card) container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p style="text-align: center; width: 100%;">Tidak ada hasil yang ditemukan.</p>';
        }
    } catch (error) {
        console.error(`Gagal memuat data dari ${endpoint}:`, error);
        container.innerHTML = '<p style="text-align: center; width: 100%;">Terjadi kesalahan saat memuat data.</p>';
    }
};

/**
 * Fungsi khusus untuk membuat dan menampilkan carousel di halaman utama.
 * @param {string} endpoint - URL API untuk trending movies.
 * @param {HTMLElement} container - Elemen DOM untuk carousel.
 */
const fetchAndBuildCarousel = async (endpoint, container) => {
    if (!container) return;
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        container.innerHTML = ''; // Bersihkan kontainer
        data.results.slice(0, 5).forEach(movie => {
            const slide = document.createElement('div');
            slide.className = 'slider';
            slide.innerHTML = `
                <div class="slide-content">
                    <h1 class="movie-title">${movie.title}</h1>
                    <p class="movie-des">${movie.overview}</p>
                </div>
                <img src="${imageBaseUrl}w1280${movie.backdrop_path}" alt="${movie.title}">
            `;
            container.appendChild(slide);
        });
    } catch (error) {
        console.error('Gagal memuat korsel:', error);
    }
};

// =========================================================================
// LOGIKA UTAMA: MENJALANKAN FUNGSI SETELAH HALAMAN SIAP
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Variabel untuk elemen di berbagai halaman ---
    const carouselContainer = document.querySelector('.carousel');
    const playerContainer = document.getElementById('player-container');
    const sportsGridContainer = document.getElementById('sports-movies-grid');
    const genreSelect = document.getElementById('genre-select');

    // --- Logika Deteksi Halaman ---
    if (carouselContainer) { // Halaman Utama (index.html)
        console.log("Halaman utama terdeteksi.");
        fetchAndBuildCarousel(apiEndpoints.trendingMovies, carouselContainer);
        fetchAndDisplayMedia(apiEndpoints.horrorMovies, document.getElementById('horror-list'));
        fetchAndDisplayMedia(apiEndpoints.trendingTv, document.getElementById('trending-tv-list'));
    } 
    
    else if (genreSelect) { // Halaman Film (film.html)
        console.log("Halaman Film terdeteksi.");
        const movieGrid = document.getElementById('movie-grid-container'); 
        const pageTitle = document.getElementById('page-title');

        const initializeFilmPage = async () => {
            try {
                const response = await fetch(apiEndpoints.movieGenres);
                const data = await response.json();
                genreSelect.innerHTML = `<option value="">Semua (Populer)</option>`;
                data.genres.forEach(genre => {
                    genreSelect.innerHTML += `<option value="${genre.id}">${genre.name}</option>`;
                });
            } catch (error) {
                console.error("Gagal memuat daftar genre:", error);
            }
            pageTitle.textContent = 'Film Populer';
            await fetchAndDisplayMedia(apiEndpoints.popularMovies, movieGrid);
        };

        genreSelect.addEventListener('change', () => {
            const genreId = genreSelect.value;
            const genreName = genreSelect.options[genreSelect.selectedIndex].text;
            if (genreId) {
                pageTitle.textContent = `Film Genre: ${genreName}`;
                fetchAndDisplayMedia(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=id-ID`, movieGrid);
            } else {
                pageTitle.textContent = 'Film Populer';
                fetchAndDisplayMedia(apiEndpoints.popularMovies, movieGrid);
            }
        });

        initializeFilmPage();
    }

    else if (sportsGridContainer) { // Halaman Olahraga (olahraga.html)
        console.log("Halaman Olahraga terdeteksi.");
        fetchAndDisplayMedia(apiEndpoints.sportsMovies, sportsGridContainer);
    }
    
    else if (playerContainer) { // Halaman Player (player.html)
        console.log("Halaman Player terdeteksi.");
        const params = new URLSearchParams(window.location.search);
        const mediaId = params.get('id');
        const mediaType = params.get('type');
        const mediaTitle = params.get('title');
        const titleElement = document.getElementById('movie-player-title');
        if (mediaId) {
            titleElement.textContent = mediaTitle || "Memuat film...";
            document.title = `Nonton ${mediaTitle || 'Film'} - kingmovie-nobar gratis`;
            const embedUrl = `https://vidfast.pro/movie/${mediaId}`;
            playerContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen="true" frameborder="0"></iframe>`;
        } else {
            titleElement.textContent = "Error: Film tidak dapat dimuat";
            playerContainer.innerHTML = '<p>Parameter tidak lengkap.</p>';
        }
    }

    // --- LOGIKA PENCARIAN REAL-TIME ---
    const searchBox = document.querySelector('.search-box');
    const mainContainers = Array.from(document.querySelectorAll('.carousel-container, .video-card-container, .main-content'));
    let searchResultsWrapper = null;
    let debounceTimeout;

    const handleSearch = (query) => {
        if (!searchResultsWrapper) {
            searchResultsWrapper = document.createElement('div');
            searchResultsWrapper.className = 'main-content';
            document.querySelector('nav').insertAdjacentElement('afterend', searchResultsWrapper);
        }

        if (!query) {
            mainContainers.forEach(container => container && (container.style.display = ''));
            searchResultsWrapper.style.display = 'none';
            return;
        }

        mainContainers.forEach(container => container && (container.style.display = 'none'));
        searchResultsWrapper.style.display = 'block';
        searchResultsWrapper.innerHTML = `<h1>Hasil Pencarian untuk "${query}"</h1><div class="movie-grid"></div>`;
        const searchGrid = searchResultsWrapper.querySelector('.movie-grid');
        fetchAndDisplayMedia(`${apiEndpoints.search}${encodeURIComponent(query)}`, searchGrid);
    };

    searchBox.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => handleSearch(e.target.value.trim()), 500);
    });
});
