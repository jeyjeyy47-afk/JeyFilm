// --- Konfigurasi API TMDB ---
const apiKey = 'bd7f7c2373a157c90b6d8585680b194c';

const apiEndpoints = {
    trendingMovies: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=id-ID`,
    horrorMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&with_genres=27&sort_by=popularity.desc`,
    trendingTv: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=id-ID`,
    upcomingMovies: `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=id-ID&page=1`
};

const imageBaseUrl = 'https://image.tmdb.org/t/p/';

// --- Fungsi Generik untuk Membuat Kartu Media (Film atau TV) ---
const createMediaCard = (item) => {
    // Jangan buat kartu jika tidak ada poster
    if (!item.poster_path) return null;

    const card = document.createElement('div');
    card.className = 'card';

    const cardImg = document.createElement('img');
    cardImg.className = 'card-img';
    cardImg.src = `${imageBaseUrl}w500${item.poster_path}`;

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    // Gunakan 'title' untuk film dan 'name' untuk serial TV
    const title = document.createElement('h2');
    title.className = 'name';
    title.textContent = item.title || item.name;

    const description = document.createElement('h6');
    description.className = 'des';
    // Tampilkan tanggal rilis jika ada, jika tidak tampilkan rating
    if (item.release_date) {
        description.textContent = `Rilis: ${item.release_date}`;
    } else {
        description.textContent = `Rating: ${item.vote_average.toFixed(1)}`;
    }

    const watchlistBtn = document.createElement('button');
    watchlistBtn.className = 'watchlist-btn';
    watchlistBtn.textContent = 'Info Lebih Lanjut';

    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(watchlistBtn);

    card.appendChild(cardImg);
    card.appendChild(cardBody);
    
    return card;
};

// --- Fungsi untuk Mengambil Data dan Menampilkannya ---

// Fungsi untuk membuat korsel utama
const fetchAndBuildCarousel = async (container) => {
    try {
        const response = await fetch(apiEndpoints.trendingMovies);
        const data = await response.json();
        // Ambil 5 film pertama untuk korsel
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
        console.error('Error fetching trending movies for carousel:', error);
    }
};

// Fungsi umum untuk mengambil data dan membangun baris atau grid
const fetchAndBuildSection = async (endpoint, container) => {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        data.results.forEach(item => {
            const card = createMediaCard(item);
            if (card) { // Pastikan kartu berhasil dibuat sebelum menambahkannya
                container.appendChild(card);
            }
        });
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
    }
};

// --- LOGIKA UTAMA: DETEKSI HALAMAN DAN JALANKAN FUNGSI ---
document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah kita di halaman utama dengan mencari elemen uniknya
    const carouselContainer = document.querySelector('.carousel');
    const horrorListContainer = document.getElementById('horror-list');
    const trendingTvListContainer = document.getElementById('trending-tv-list');

    // Cek apakah kita di halaman film dengan mencari elemen uniknya
    const upcomingGridContainer = document.getElementById('upcoming-movies-grid');

    // Jika elemen-elemen halaman utama ada, muat konten untuk halaman utama
    if (carouselContainer && horrorListContainer && trendingTvListContainer) {
        console.log("Halaman utama terdeteksi. Memuat konten...");
        fetchAndBuildCarousel(carouselContainer);
        fetchAndBuildSection(apiEndpoints.horrorMovies, horrorListContainer);
        fetchAndBuildSection(apiEndpoints.trendingTv, trendingTvListContainer);
    } 
    // Jika elemen halaman film ada, muat konten untuk halaman film
    else if (upcomingGridContainer) {
        console.log("Halaman film terdeteksi. Memuat film mendatang...");
        fetchAndBuildSection(apiEndpoints.upcomingMovies, upcomingGridContainer);
    }
});
