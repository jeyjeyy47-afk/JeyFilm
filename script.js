// --- Konfigurasi API TMDB ---
const apiKey = 'bd7f7c2373a157c90b6d8585680b194c';

const apiEndpoints = {
    trendingMovies: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=id-ID`,
    horrorMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&with_genres=27&sort_by=popularity.desc`,
    trendingTv: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=id-ID`,
    // ENDPOINT BARU untuk film populer sebagai default di halaman film
    popularMovies: `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=id-ID&page=1`,
    sportsMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&sort_by=popularity.desc&with_genres=18&with_keywords=9715`,
    search: `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=id-ID&query=`,
    movieGenres: `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=id-ID`
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

// --- Fungsi Generik untuk Mengambil dan Menampilkan Data di Grid atau List ---
const fetchAndDisplayMedia = async (endpoint, container) => {
    if (!container) {
        console.error("Kesalahan: Kontainer untuk menampilkan media tidak ditemukan.");
        return;
    }
    container.innerHTML = '<p style="text-align: center; width: 100%;">Memuat...</p>';
    
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        container.innerHTML = '';

        const results = data.results || [];
        if (results.length > 0) {
            results.forEach(item => {
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


// --- LOGIKA UTAMA: DETEKSI HALAMAN, PENCARIAN, DAN JALANKAN FUNGSI ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Variabel untuk elemen di berbagai halaman ---
    const carouselContainer = document.querySelector('.carousel');
    const playerContainer = document.getElementById('player-container');
    const sportsGridContainer = document.getElementById('sports-movies-grid');
    const genreSelect = document.getElementById('genre-select');

    // --- Logika Deteksi Halaman ---
    if (carouselContainer) { // Halaman Utama (index.html)
        console.log("Halaman utama terdeteksi.");
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
        fetchAndBuildCarousel(carouselContainer);
        fetchAndDisplayMedia(apiEndpoints.horrorMovies, document.getElementById('horror-list'));
        fetchAndDisplayMedia(apiEndpoints.trendingTv, document.getElementById('trending-tv-list'));
    } 
    
    // =========================================================================
    // BAGIAN INI TELAH DIPERBAIKI SECARA SPESIFIK
    // =========================================================================
    else if (genreSelect) { // Logika untuk halaman Film (film.html)
        console.log("Halaman Film terdeteksi, menginisialisasi filter genre.");

        const movieGrid = document.getElementById('movie-grid-container');
        const pageTitle = document.getElementById('page-title');

        // Fungsi untuk menginisialisasi halaman: mengisi genre dan memuat film default
        const initializeFilmPage = async () => {
            pageTitle.textContent = 'Film Populer';

            // 1. Mengisi dropdown genre
            try {
                const response = await fetch(apiEndpoints.movieGenres);
                const data = await response.json();
                
                // Tambahkan opsi default "Semua (Populer)" terlebih dahulu
                genreSelect.innerHTML = `<option value="">Semua (Populer)</option>`;
                
                // Tambahkan semua genre dari API
                data.genres.forEach(genre => {
                    genreSelect.innerHTML += `<option value="${genre.id}">${genre.name}</option>`;
                });
            } catch (error) {
                console.error("Gagal memuat daftar genre:", error);
                genreSelect.innerHTML = `<option value="">Gagal memuat genre</option>`;
            }

            // 2. Muat film default (POPULER) setelah genre selesai dimuat
            await fetchAndDisplayMedia(apiEndpoints.popularMovies, movieGrid);
        };

        // Tambahkan event listener untuk merespons perubahan pada dropdown
        genreSelect.addEventListener('change', () => {
            const genreId = genreSelect.value;
            const genreName = genreSelect.options[genreSelect.selectedIndex].text;

            if (genreId) {
                // Jika sebuah genre dipilih, ambil film berdasarkan genre tersebut
                pageTitle.textContent = `Film Genre: ${genreName}`;
                const genreEndpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&sort_by=popularity.desc&with_genres=${genreId}`;
                fetchAndDisplayMedia(genreEndpoint, movieGrid);
            } else {
                // Jika "Semua (Populer)" dipilih, kembali ke daftar film populer
                pageTitle.textContent = 'Film Populer';
                fetchAndDisplayMedia(apiEndpoints.popularMovies, movieGrid);
            }
        });

        // Jalankan fungsi inisialisasi saat halaman dimuat
        initializeFilmPage();
    }
    // =========================================================================
    // AKHIR DARI BAGIAN YANG DIPERBAIKI
    // =========================================================================

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
        if (mediaId && mediaType) {
            titleElement.textContent = mediaTitle || "Memuat film...";
            document.title = `Nonton ${mediaTitle || 'Film'} - kingmovie-nobar gratis`;
            const embedUrl = `https://vidfast.pro/movie/${mediaId}`;
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('frameborder', '0');
            playerContainer.innerHTML = '';
            playerContainer.appendChild(iframe);
        } else {
            titleElement.textContent = "Error: Film tidak dapat dimuat";
            playerContainer.innerHTML = '<p>Parameter tidak lengkap.</p>';
        }
    }

    // --- LOGIKA PENCARIAN REAL-TIME (TIDAK BERUBAH) ---
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

        const searchGrid = document.createElement('div');
        searchGrid.className = 'movie-grid';
        
        searchResultsWrapper.innerHTML = '';
        const title = document.createElement('h1');
        title.textContent = `Hasil Pencarian untuk "${query}"`;
        searchResultsWrapper.appendChild(title);
        searchResultsWrapper.appendChild(searchGrid);
        
        fetchAndDisplayMedia(`${apiEndpoints.search}${encodeURIComponent(query)}`, searchGrid);
    };

    searchBox.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        const query = e.target.value.trim();
        debounceTimeout = setTimeout(() => {
            handleSearch(query);
        }, 500);
    });
});
