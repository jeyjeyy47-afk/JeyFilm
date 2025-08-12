// --- Konfigurasi API TMDB ---
const apiKey = 'bd7f7c2373a157c90b6d8585680b194c';

const apiEndpoints = {
    nowPlayingMovies: `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=id-ID&page=1`,
    horrorMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&with_genres=27&sort_by=popularity.desc`,
    trendingTv: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=id-ID`,
    popularMovies: `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=id-ID&page=1`,
    fantasyMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&with_genres=14&sort_by=popularity.desc`,
    search: `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=id-ID&query=`,
    movieGenres: `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=id-ID`
};

const imageBaseUrl = 'https://image.tmdb.org/t/p/';


// =========================================================================
// BAGIAN FUNGSI-FUNGSI UTAMA
// =========================================================================

const createMediaCard = (item) => {
    if (!item.poster_path) return null;
    const cardLink = document.createElement('a');
    cardLink.className = 'card';
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    if (mediaType === 'person') return null;
    
    cardLink.href = `player.html?id=${item.id}&type=${mediaType}&title=${encodeURIComponent(item.title || item.name)}`;
    
    const cardImg = document.createElement('img');
    cardImg.src = `${imageBaseUrl}w500${item.poster_path}`;
    cardImg.className = 'card-img';
    cardImg.alt = item.title || item.name;

    cardLink.innerHTML = `
        <div class="card-body">
            <h2 class="name">${item.title || item.name}</h2>
            <h6 class="des">${item.release_date ? `Rilis: ${item.release_date}` : `Rating: ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}`}</h6>
            <button class="watchlist-btn">Tonton Trailer</button>
        </div>
    `;
    cardLink.prepend(cardImg); // Tambahkan gambar di awal

    // REVISI: Klik pada gambar akan membuka modal detail
    cardImg.addEventListener('click', (e) => {
        e.preventDefault();
        openDetailsModal(item.id, mediaType);
    });

    cardLink.querySelector('.watchlist-btn').addEventListener('click', (e) => {
        e.preventDefault();
        openTrailerModal(item.id, mediaType);
    });
    return cardLink;
};

const fetchAndDisplayMedia = async (endpoint, container) => {
    // ... (Fungsi ini tidak berubah)
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

const fetchAndBuildCarousel = async (endpoint, container) => {
    // ... (Fungsi ini tidak berubah)
    if (!container) return;
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        container.innerHTML = ''; 
        const movies = data.results.slice(0, 5);
        if (movies.length === 0) return;
        movies.forEach(movie => {
            const slide = document.createElement('a'); 
            slide.className = 'slider';
            slide.href = `player.html?id=${movie.id}&type=movie&title=${encodeURIComponent(movie.title)}`;
            slide.innerHTML = `
                <div class="slide-content">
                    <h1 class="movie-title">${movie.title}</h1>
                    <p class="movie-des">${movie.overview}</p>
                </div>
                <img src="${imageBaseUrl}w1280${movie.backdrop_path}" alt="${movie.title}">`;
            container.appendChild(slide);
        });
        let slideIndex = 0;
        setInterval(() => {
            slideIndex = (slideIndex + 1) % movies.length;
            container.style.transform = `translateX(-${slideIndex * 100}%)`;
        }, 5000);
    } catch (error) {
        console.error('Gagal memuat korsel:', error);
    }
};

// --- FUNGSI-FUNGSI MODAL ---
const openTrailerModal = async (mediaId, mediaType) => {
    // ... (Fungsi ini tidak berubah)
    const trailerModal = document.getElementById('trailerModal');
    const trailerIframe = document.getElementById('trailerIframe');
    if (!trailerModal || !trailerIframe) return;

    try {
        const videoEndpoint = `https://api.themoviedb.org/3/${mediaType}/${mediaId}/videos?api_key=${apiKey}`;
        const response = await fetch(videoEndpoint);
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

        if (trailer && trailer.key) {
            trailerIframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
            trailerModal.classList.add('active');
        } else {
            alert('Maaf, trailer tidak ditemukan untuk judul ini.');
        }
    } catch (error) {
        console.error('Gagal memuat trailer:', error);
        alert('Gagal memuat trailer.');
    }
};

// FUNGSI BARU: Untuk membuka dan mengisi modal detail
const openDetailsModal = async (mediaId, mediaType) => {
    const detailsModal = document.getElementById('detailsModal');
    const detailsContent = document.querySelector('.details-modal-content');
    if (!detailsModal || !detailsContent) return;

    detailsContent.innerHTML = '<p style="text-align:center; padding: 50px;">Memuat detail...</p>';
    detailsModal.classList.add('active');

    try {
        // Buat dua URL API untuk detail dan kredit (pemain)
        const detailsUrl = `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}&language=id-ID`;
        const creditsUrl = `https://api.themoviedb.org/3/${mediaType}/${mediaId}/credits?api_key=${apiKey}&language=id-ID`;

        // Ambil kedua data secara bersamaan
        const [detailsRes, creditsRes] = await Promise.all([fetch(detailsUrl), fetch(creditsUrl)]);
        if (!detailsRes.ok || !creditsRes.ok) throw new Error('Gagal mengambil data detail.');
        
        const details = await detailsRes.json();
        const credits = await creditsRes.json();
        
        // Buat daftar genre
        const genresHtml = details.genres.map(genre => `<li>${genre.name}</li>`).join('');

        // Buat daftar pemain (maksimal 10)
        const castHtml = credits.cast.slice(0, 10).map(member => `
            <div class="cast-member">
                <img src="${member.profile_path ? imageBaseUrl + 'w185' + member.profile_path : 'placeholder.jpg'}" class="cast-photo" alt="${member.name}">
                <div class="cast-name">${member.name}</div>
                <div class="cast-character">${member.character}</div>
            </div>
        `).join('');

        // Isi konten modal dengan semua data yang sudah didapat
        detailsContent.innerHTML = `
            <span class="modal-close-btn" id="closeDetailsBtn">&times;</span>
            <div class="details-header">
                <div class="details-poster">
                    <img src="${imageBaseUrl}w500${details.poster_path}" alt="${details.title || details.name}">
                </div>
                <div class="details-info">
                    <h1>${details.title || details.name}</h1>
                    <ul class="genres-list">${genresHtml}</ul>
                    <div class="rating">⭐ ${details.vote_average.toFixed(1)} / 10</div>
                    <p class="synopsis">${details.overview || 'Sinopsis tidak tersedia.'}</p>
                </div>
            </div>
            <div class="cast-section">
                <h3>Pemeran Utama</h3>
                <div class="cast-list">${castHtml}</div>
            </div>
        `;
        
        // Tambahkan event listener untuk tombol tutup yang baru dibuat
        document.getElementById('closeDetailsBtn').addEventListener('click', () => {
            detailsModal.classList.remove('active');
        });

    } catch (error) {
        console.error('Gagal membuka detail modal:', error);
        detailsContent.innerHTML = '<p style="text-align:center; padding: 50px;">Gagal memuat detail. Silakan coba lagi.</p>';
    }
};


// =========================================================================
// LOGIKA UTAMA: MENJALANKAN FUNGSI SETELAH HALAMAN SIAP
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- MEMBUAT ELEMEN-ELEMEN MODAL SECARA DINAMIS ---
    const trailerModalHTML = `
        <div id="trailerModal" class="modal-backdrop">
            <div class="trailer-modal-content">
                <span class="modal-close-btn">&times;</span>
                <div class="trailer-video-container">
                    <iframe id="trailerIframe" src="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </div>
            </div>
        </div>`;
    const detailsModalHTML = `
        <div id="detailsModal" class="modal-backdrop">
            <div class="details-modal-content">
                <!-- Konten akan diisi oleh JavaScript -->
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', trailerModalHTML);
    document.body.insertAdjacentHTML('beforeend', detailsModalHTML);

    // --- Menambahkan Event Listener untuk Menutup Modal ---
    const trailerModal = document.getElementById('trailerModal');
    const detailsModal = document.getElementById('detailsModal');
    
    const closeModal = (modal) => {
        modal.classList.remove('active');
        const iframe = modal.querySelector('iframe');
        if (iframe) iframe.src = ''; // Hentikan video jika ada
    };

    trailerModal.querySelector('.modal-close-btn').addEventListener('click', () => closeModal(trailerModal));
    trailerModal.addEventListener('click', (e) => { if (e.target === trailerModal) closeModal(trailerModal); });
    detailsModal.addEventListener('click', (e) => { if (e.target === detailsModal) closeModal(detailsModal); });

    // --- Logika Deteksi Halaman ---
    const carouselContainer = document.querySelector('.carousel');
    const playerContainer = document.getElementById('player-container');
    const fantasyGridContainer = document.getElementById('fantasy-movies-grid');
    const genreSelect = document.getElementById('genre-select');

    if (carouselContainer) { // Halaman Utama
        fetchAndBuildCarousel(apiEndpoints.nowPlayingMovies, carouselContainer);
        fetchAndDisplayMedia(apiEndpoints.horrorMovies, document.getElementById('horror-list'));
        fetchAndDisplayMedia(apiEndpoints.trendingTv, document.getElementById('trending-tv-list'));
    } 
    
    else if (genreSelect) { // Halaman Film
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
            } catch (error) { console.error("Gagal memuat daftar genre:", error); }
            if(pageTitle) pageTitle.textContent = 'Film Populer';
            await fetchAndDisplayMedia(apiEndpoints.popularMovies, movieGrid);
        };
        genreSelect.addEventListener('change', () => {
            const genreId = genreSelect.value;
            const genreName = genreSelect.options[genreSelect.selectedIndex].text;
            if (genreId) {
                if(pageTitle) pageTitle.textContent = `Film Genre: ${genreName}`;
                fetchAndDisplayMedia(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=id-ID`, movieGrid);
            } else {
                if(pageTitle) pageTitle.textContent = 'Film Populer';
                fetchAndDisplayMedia(apiEndpoints.popularMovies, movieGrid);
            }
        });
        initializeFilmPage();
    }

    else if (fantasyGridContainer) { // Halaman Fantasi
        fetchAndDisplayMedia(apiEndpoints.fantasyMovies, fantasyGridContainer);
    }
    
    else if (playerContainer) { // Halaman Player
        const params = new URLSearchParams(window.location.search);
        const mediaId = params.get('id');
        const mediaTitle = params.get('title');
        const titleElement = document.getElementById('movie-player-title');
        if (mediaId) {
            if (titleElement) titleElement.textContent = mediaTitle || "Memuat film...";
            document.title = `Nonton ${mediaTitle || 'Film'} - kingmovie-nobar gratis`;
            const embedUrl = `https://vidfast.pro/movie/${mediaId}`;
            playerContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen="true" frameborder="0"></iframe>`;
        } else {
            if (titleElement) titleElement.textContent = "Error: Film tidak dapat dimuat";
            playerContainer.innerHTML = '<p>Parameter ID film tidak ditemukan di URL.</p>';
        }
    }

    // --- LOGIKA PENCARIAN REAL-TIME ---
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        const mainContainers = Array.from(document.querySelectorAll('.carousel-container, .video-card-container, .main-content'));
        let searchResultsWrapper = null;
        let debounceTimeout;
        const handleSearch = (query) => {
            if (!searchResultsWrapper) {
                searchResultsWrapper = document.createElement('div');
                searchResultsWrapper.className = 'main-content';
                const nav = document.querySelector('nav');
                if (nav) nav.insertAdjacentElement('afterend', searchResultsWrapper);
            }
            if (!query) {
                mainContainers.forEach(container => container && (container.style.display = ''));
                if (searchResultsWrapper) searchResultsWrapper.style.display = 'none';
                return;
            }
            mainContainers.forEach(container => container && (container.style.display = 'none'));
            if (searchResultsWrapper) {
                searchResultsWrapper.style.display = 'block';
                searchResultsWrapper.innerHTML = `<h1>Hasil Pencarian untuk "${query}"</h1><div class="movie-grid"></div>`;
                const searchGrid = searchResultsWrapper.querySelector('.movie-grid');
                fetchAndDisplayMedia(`${apiEndpoints.search}${encodeURIComponent(query)}`, searchGrid);
            }
        };
        searchBox.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => handleSearch(e.target.value.trim()), 500);
        });
    }
});
