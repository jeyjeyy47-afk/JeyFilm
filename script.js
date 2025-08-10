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

    // PERBAIKAN UTAMA: Membuat elemen <a> sebagai pembungkus utama kartu
    const cardLink = document.createElement('a');
    cardLink.className = 'card';
    
    // Tentukan jenis media (film atau tv) untuk URL embed yang benar
    const mediaType = item.title ? 'movie' : 'tv';
    
    // Mengarahkan tautan ke player.html dengan ID dan judul sebagai parameter
    // ID TMDB adalah kunci untuk memuat video yang benar
    cardLink.href = `player.html?id=${item.id}&type=${mediaType}&title=${encodeURIComponent(item.title || item.name)}`;

    // === Membangun isi visual dari kartu di dalam tautan ===
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
    
    // Mencegah klik pada tombol ini agar tidak ikut menavigasi halaman
    watchlistBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Anda mengklik info untuk: ${item.title || item.name}`);
    });

    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(watchlistBtn);

    cardLink.appendChild(cardImg);
    cardLink.appendChild(cardBody);
    
    // Mengembalikan elemen <a> yang sudah lengkap
    return cardLink;
};

// --- Fungsi untuk Mengambil Data dan Menampilkannya ---

const fetchAndBuildCarousel = async (container) => {
    try {
        const response = await fetch(apiEndpoints.trendingMovies);
        const data = await response.json();
        data.results.slice(0, 5).forEach(movie => {
            // ... (logika korsel tidak berubah)
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
        console.error(`Error fetching data from ${endpoint}:`, error);
    }
};

// --- LOGIKA UTAMA: DETEKSI HALAMAN DAN JALANKAN FUNGSI ---
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel');
    const horrorListContainer = document.getElementById('horror-list');
    const trendingTvListContainer = document.getElementById('trending-tv-list');
    const upcomingGridContainer = document.getElementById('upcoming-movies-grid');
    const playerContainer = document.getElementById('player-container');

    // LOGIKA UNTUK HALAMAN UTAMA (index.html)
    if (carouselContainer && horrorListContainer && trendingTvListContainer) {
        fetchAndBuildCarousel(carouselContainer);
        fetchAndBuildSection(apiEndpoints.horrorMovies, horrorListContainer);
        fetchAndBuildSection(apiEndpoints.trendingTv, trendingTvListContainer);
    } 
    // LOGIKA UNTUK HALAMAN FILM (film.html)
    else if (upcomingGridContainer) {
        fetchAndBuildSection(apiEndpoints.upcomingMovies, upcomingGridContainer);
    }
    // LOGIKA UNTUK HALAMAN PEMUTAR VIDEO (player.html)
    else if (playerContainer) {
        const params = new URLSearchParams(window.location.search);
        const mediaId = params.get('id');
        const mediaType = params.get('type'); // 'movie' atau 'tv'
        const mediaTitle = params.get('title');

        if (mediaId && mediaType) {
            const titleElement = document.getElementById('movie-player-title');
            if (mediaTitle) {
                titleElement.textContent = mediaTitle;
                document.title = `Nonton ${mediaTitle} - kingmovie-nobar gratis`;
            }

            const iframe = document.createElement('iframe');
            // Membuat URL embed berdasarkan tipe media
            iframe.src = `https://vidfast.net/embed/${mediaType}/${mediaId}`;
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('frameborder', '0');
            
            playerContainer.appendChild(iframe);
        } else {
            const titleElement = document.getElementById('movie-player-title');
            titleElement.textContent = "Error: Film atau Serial TV tidak ditemukan.";
            playerContainer.innerHTML = '<p>Silakan kembali dan pilih media lain.</p>';
        }
    }
});
