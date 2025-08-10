// --- Konfigurasi API TMDB ---
const apiKey = 'bd7f7c2373a157c90b6d8585680b194c';

const apiEndpoints = {
    trendingMovies: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=id-ID`,
    horrorMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&with_genres=27&sort_by=popularity.desc`,
    trendingTv: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=id-ID`,
    // MODIFIKASI: Endpoint baru untuk Film Mendatang
    upcomingMovies: `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=id-ID&page=1`
};

const imageBaseUrl = 'https://image.tmdb.org/t/p/';

// --- FUNGSI PEMBUATAN ELEMEN (DAPAT DIGUNAKAN KEMBALI) ---

// Fungsi generik untuk membuat kartu film/TV
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
    
    const title = document.createElement('h2');
    title.className = 'name';
    title.textContent = item.title || item.name;

    const description = document.createElement('h6');
    description.className = 'des';
    // Menampilkan tanggal rilis untuk film mendatang
    description.textContent = item.release_date ? `Rilis: ${item.release_date}` : `Rating: ${item.vote_average.toFixed(1)}`;

    const watchlistBtn = document.createElement('button');
    watchlistBtn.className = 'watchlist-btn';
    watchlistBtn.textContent = 'info lebih lanjut';

    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(watchlistBtn);

    card.appendChild(cardImg);
    card.appendChild(cardBody);
    
    return card;
};

// --- FUNGSI PENGAMBIL DATA (FETCH) ---

// Fungsi untuk membuat korsel utama
const fetchAndBuildCarousel = async () => { /* ... (Tidak ada perubahan di sini) ... */ };
const fetchAndShowHorrorMovies = async () => { /* ... (Tidak ada perubahan di sini) ... */ };
const fetchAndShowTrendingTv = async () => { /* ... (Tidak ada perubahan di sini) ... */ };

// SALIN-TEMPEL FUNGSI-FUNGSI DARI JAWABAN SEBELUMNYA KE SINI,
// TAPI PASTIKAN MEREKA MENGGUNAKAN FUNGSI createMediaCard YANG BARU.

// --- CONTOH FUNGSI LAMA YANG DIPERBARUI ---
const fetchAndShowHorrorMoviesUpdated = async (container) => {
    try {
        const response = await fetch(apiEndpoints.horrorMovies);
        const data = await response.json();
        data.results.forEach(item => {
            const card = createMediaCard(item);
            if(card) container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching horror movies:', error);
    }
};

// MODIFIKASI: Fungsi baru untuk mengambil dan menampilkan film mendatang
const fetchAndShowUpcomingMovies = async (container) => {
    try {
        const response = await fetch(apiEndpoints.upcomingMovies);
        const data = await response.json();
        data.results.forEach(item => {
            const card = createMediaCard(item);
            if (card) container.appendChild(card); // Tambahkan kartu ke container grid
        });
    } catch (error) {
        console.error('Error fetching upcoming movies:', error);
    }
};


// --- LOGIKA UTAMA: DETEKSI HALAMAN DAN JALANKAN FUNGSI YANG SESUAI ---
document.addEventListener('DOMContentLoaded', () => {
    // Cari elemen yang hanya ada di halaman utama
    const carouselContainer = document.querySelector('.carousel');
    const horrorList = document.getElementById('horror-list');
    const trendingTvList = document.getElementById('trending-tv-list');

    // Cari elemen yang hanya ada di halaman film
    const upcomingGrid = document.getElementById('upcoming-movies-grid');

    // Jika elemen halaman utama ditemukan, jalankan fungsi untuk halaman utama
    if (carouselContainer && horrorList && trendingTvList) {
        console.log("Halaman utama terdeteksi. Memuat data utama...");
        // Ganti fungsi lama dengan yang sudah diupdate
        // fetchAndBuildCarousel();
        // fetchAndShowHorrorMoviesUpdated(horrorList);
        // fetchAndShowTrendingTvUpdated(trendingTvList); // Anda juga perlu mengupdate fungsi ini
    } 
    // Jika elemen halaman film ditemukan, jalankan fungsi untuk film mendatang
    else if (upcomingGrid) {
        console.log("Halaman film mendatang terdeteksi. Memuat data film...");
        fetchAndShowUpcomingMovies(upcomingGrid);
    }
});
