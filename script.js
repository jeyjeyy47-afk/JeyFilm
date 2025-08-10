// --- Konfigurasi API TMDB ---
const apiKey = 'bd7f7c2373a157c90b6d8585680b194c';

const apiEndpoints = {
    trendingMovies: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=id-ID`,
    horrorMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&with_genres=27&sort_by=popularity.desc`,
    trendingTv: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=id-ID`,
    upcomingMovies: `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=id-ID&page=1`
};

const imageBaseUrl = 'https://image.tmdb.org/t/p/';

// --- Fungsi Generik untuk Membuat Kartu Media ---
const createMediaCard = (item) => {
    if (!item.poster_path) return null;

    const cardLink = document.createElement('a');
    cardLink.className = 'card';
    
    // Tentukan tipe media berdasarkan keberadaan properti 'title' (untuk film) atau 'name' (untuk TV)
    const mediaType = item.title ? 'movie' : 'tv';
    
    // Membuat URL yang akan dibuka saat kartu diklik
    cardLink.href = `player.html?id=${item.id}&type=${mediaType}&title=${encodeURIComponent(item.title || item.name)}`;

    // --- Membangun elemen visual di dalam kartu ---
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
    description.textContent = item.release_date ? `Rilis: ${item.release_date}` : `Rating: ${item.vote_average.toFixed(1)}`;

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

// --- LOGIKA UTAMA: DETEKSI HALAMAN DAN JALANKAN FUNGSI ---
document.addEventListener('DOMContentLoaded', () => {
    // Cari elemen unik untuk setiap halaman
    const carouselContainer = document.querySelector('.carousel');
    const upcomingGridContainer = document.getElementById('upcoming-movies-grid');
    const playerContainer = document.getElementById('player-container');

    // Cek halaman mana yang sedang aktif
    if (carouselContainer) { // Halaman Utama
        console.log("Halaman utama terdeteksi.");
        const horrorListContainer = document.getElementById('horror-list');
        const trendingTvListContainer = document.getElementById('trending-tv-list');
        fetchAndBuildCarousel(carouselContainer);
        fetchAndBuildSection(apiEndpoints.horrorMovies, horrorListContainer);
        fetchAndBuildSection(apiEndpoints.trendingTv, trendingTvListContainer);
    } 
    else if (upcomingGridContainer) { // Halaman Film
        console.log("Halaman Film terdeteksi.");
        fetchAndBuildSection(apiEndpoints.upcomingMovies, upcomingGridContainer);
    }
    else if (playerContainer) { // Halaman Player
        console.log("Halaman Player terdeteksi.");
        const params = new URLSearchParams(window.location.search);
        const mediaId = params.get('id');
        const mediaType = params.get('type');
        const mediaTitle = params.get('title');
        
        // Menampilkan data yang kita dapat dari URL ke konsol
        console.log("ID Media:", mediaId);
        console.log("Tipe Media:", mediaType);
        console.log("Judul Media:", mediaTitle);

        const titleElement = document.getElementById('movie-player-title');

        if (mediaId && mediaType) {
            // Perbarui judul halaman dan tab browser
            titleElement.textContent = mediaTitle || "Memuat film...";
            document.title = `Nonton ${mediaTitle || 'Film'} - kingmovie-nobar gratis`;

            // MEMBUAT URL EMBED - MENGGUNAKAN FORMAT BARU YANG DIMINTA
            // PERHATIAN: URL ini diasumsikan hanya untuk FILM.
            // Jika serial TV juga perlu format berbeda, logika tambahan diperlukan.
            const embedUrl = `https://vidfast.pro/movie/${mediaId}`;

            console.log("Mencoba memuat iframe dengan URL:", embedUrl);

            // Membuat dan menambahkan iframe ke halaman
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('frameborder', '0');
            
            playerContainer.appendChild(iframe);
        } else {
            console.error("Kesalahan: ID atau Tipe media tidak ditemukan di URL.");
            titleElement.textContent = "Error: Film tidak dapat dimuat";
            playerContainer.innerHTML = '<p>Parameter tidak lengkap. Silakan kembali dan pilih film atau serial TV lain.</p>';
        }
    }
});
