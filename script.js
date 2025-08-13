// --- Konfigurasi API TMDB ---
const apiKey = 'bd7f7c2373a157c90b6d8585680b194c';

const apiEndpoints = {
    trendingMovies: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=id-ID`,
    horrorMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&with_genres=27&sort_by=popularity.desc`,
    trendingTv: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=id-ID`,
    upcomingMovies: `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=id-ID&page=1`,
    // Endpoint untuk halaman Serial TV
    popularTv: `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=id-ID&page=1`,
    movieGenres: `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=id-ID`,
    tvGenres: `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=id-ID`
};

const imageBaseUrl = 'https://image.tmdb.org/t/p/';

// --- Variabel Global untuk Menyimpan Genre ---
const genreMap = new Map();

// --- Fungsi untuk Mengambil dan Menyimpan Semua Genre ---
const fetchGenres = async () => {
    try {
        const [movieGenresRes, tvGenresRes] = await Promise.all([
            fetch(apiEndpoints.movieGenres),
            fetch(apiEndpoints.tvGenres)
        ]);

        const movieGenresData = await movieGenresRes.json();
        const tvGenresData = await tvGenresRes.json();

        movieGenresData.genres.forEach(genre => genreMap.set(genre.id, genre.name));
        tvGenresData.genres.forEach(genre => genreMap.set(genre.id, genre.name));
        
        console.log("Daftar genre berhasil dimuat:", genreMap);
    } catch (error) {
        console.error('Gagal memuat daftar genre:', error);
    }
};


// --- Fungsi Generik untuk Membuat Kartu Media (dengan Detail) ---
const createMediaCard = (item) => {
    if (!item.poster_path) return null;

    const cardLink = document.createElement('a');
    cardLink.className = 'card';
    
    // Tentukan tipe media (film punya 'title', TV punya 'name')
    const mediaType = item.title ? 'movie' : 'tv';
    
    // Buat URL untuk halaman pemutar dengan parameter yang dibutuhkan
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

    // -- MEMBUAT WADAH DETAIL BARU --
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'details';

    // Menambahkan Rating
    const rating = document.createElement('span');
    rating.className = 'rating';
    rating.textContent = `⭐ ${item.vote_average.toFixed(1)}`;
    
    // Menambahkan Genre
    const genres = document.createElement('span');
    genres.className = 'genres';
    const genreNames = item.genre_ids
        .map(id => genreMap.get(id)) // Ambil nama genre dari Map
        .filter(Boolean) // Hapus jika ada genre yang tidak ditemukan
        .slice(0, 2) // Ambil maksimal 2 genre
        .join(', '); // Gabungkan dengan koma
    genres.textContent = genreNames || 'Umum'; // Fallback jika tidak ada genre

    detailsContainer.appendChild(rating);
    detailsContainer.appendChild(genres);
    
    const watchlistBtn = document.createElement('button');
    watchlistBtn.className = 'watchlist-btn';
    watchlistBtn.textContent = 'Tonton Sekarang';

    cardBody.appendChild(title);
    cardBody.appendChild(detailsContainer); // Menambahkan kontainer detail baru
    cardBody.appendChild(watchlistBtn);

    cardLink.appendChild(cardImg);
    cardLink.appendChild(cardBody);
    
    return cardLink;
};

// --- Fungsi untuk Mengambil Data Korsel ---
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

// --- Fungsi untuk Mengambil Data dan Membangun Section ---
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
document.addEventListener('DOMContentLoaded', async () => {
    // Langkah 1: Selalu ambil data genre terlebih dahulu
    await fetchGenres();

    // Langkah 2: Cari elemen unik untuk setiap halaman
    const carouselContainer = document.querySelector('.carousel');
    const upcomingGridContainer = document.getElementById('upcoming-movies-grid');
    const tvGridContainer = document.getElementById('tv-series-grid'); // Elemen untuk halaman TV
    const playerContainer = document.getElementById('player-container');

    // Langkah 3: Jalankan kode yang sesuai berdasarkan halaman yang aktif
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
    else if (tvGridContainer) { // Halaman Serial TV (BARU)
        console.log("Halaman Serial TV terdeteksi.");
        fetchAndBuildSection(apiEndpoints.popularTv, tvGridContainer);
    }
    else if (playerContainer) { // Halaman Player
        console.log("Halaman Player terdeteksi.");
        const params = new URLSearchParams(window.location.search);
        const mediaId = params.get('id');
        const mediaType = params.get('type');
        const mediaTitle = params.get('title');
        
        const titleElement = document.getElementById('movie-player-title');
        if (mediaId && mediaType) {
            titleElement.textContent = mediaTitle || "Memuat...";
            document.title = `Nonton ${mediaTitle || 'Konten'} - kingmovie-nobar gratis`;
            
            // Membuat URL embed dan iframe untuk pemutar video
            const embedUrl = `https://vidfast.net/embed/${mediaId}`;
            console.log("Mencoba memuat iframe dengan URL:", embedUrl);

            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('frameborder', '0');
            
            playerContainer.appendChild(iframe);
        } else {
            console.error("Kesalahan: ID atau Tipe media tidak ditemukan di URL.");
            titleElement.textContent = "Error: Konten tidak dapat dimuat";
            playerContainer.innerHTML = '<p>Parameter tidak lengkap. Silakan kembali dan pilih konten lain.</p>';
        }
    }
});
