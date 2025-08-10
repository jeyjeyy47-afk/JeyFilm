// --- Konfigurasi API TMDB ---
const apiKey = 'bd7f7c2373a157c90b6d8585680b194c';

// URL untuk mengambil data dari TMDB
const apiEndpoints = {
    trendingMovies: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=id-ID`,
    // MODIFIKASI: Endpoint untuk film horor, diurutkan berdasarkan popularitas
    horrorMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=id-ID&with_genres=27&sort_by=popularity.desc`,
    trendingTv: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&language=id-ID`
};

// URL dasar untuk gambar
const imageBaseUrl = 'https://image.tmdb.org/t/p/';

// --- Mengambil Kontainer dari HTML ---
const carouselContainer = document.querySelector('.carousel');
// MODIFIKASI: Mengambil kontainer horor
const horrorMoviesContainer = document.getElementById('horror-list');
const trendingTvContainer = document.getElementById('trending-tv-list');

// --- Fungsi untuk Mengambil Data dan Menampilkan ---

// Fungsi untuk membuat korsel utama (Tidak berubah)
const fetchAndBuildCarousel = async () => {
    try {
        const response = await fetch(apiEndpoints.trendingMovies);
        const data = await response.json();
        const movies = data.results;

        movies.slice(0, 5).forEach(movie => {
            const slide = document.createElement('div');
            const imgElement = document.createElement('img');
            const content = document.createElement('div');
            const h1 = document.createElement('h1');
            const p = document.createElement('p');

            h1.textContent = movie.title;
            p.textContent = movie.overview;
            imgElement.src = `${imageBaseUrl}w1280${movie.backdrop_path}`;
            
            content.appendChild(h1);
            content.appendChild(p);
            slide.appendChild(content);
            slide.appendChild(imgElement);
            
            slide.className = 'slider';
            content.className = 'slide-content';
            h1.className = 'movie-title';
            p.className = 'movie-des';

            carouselContainer.appendChild(slide);
        });
    } catch (error) {
        console.error('Error fetching trending movies:', error);
    }
};

// Fungsi generik untuk membuat baris kartu (Tidak berubah)
const buildMediaRow = (mediaList, container) => {
    mediaList.forEach(item => {
        if (item.poster_path) {
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
            description.textContent = 'Rating: ' + item.vote_average.toFixed(1);
            const watchlistBtn = document.createElement('button');
            watchlistBtn.className = 'watchlist-btn';
            watchlistBtn.textContent = 'info lebih lanjut';

            cardBody.appendChild(title);
            cardBody.appendChild(description);
            cardBody.appendChild(watchlistBtn);
            card.appendChild(cardImg);
            card.appendChild(cardBody);
            container.appendChild(card);
        }
    });
};

// MODIFIKASI: Fungsi untuk mengambil film horor
const fetchAndShowHorrorMovies = async () => {
    try {
        const response = await fetch(apiEndpoints.horrorMovies);
        const data = await response.json();
        buildMediaRow(data.results, horrorMoviesContainer);
    } catch (error) {
        console.error('Error fetching horror movies:', error);
    }
};

// Fungsi untuk mengambil serial TV tren (Tidak berubah)
const fetchAndShowTrendingTv = async () => {
    try {
        const response = await fetch(apiEndpoints.trendingTv);
        const data = await response.json();
        buildMediaRow(data.results, trendingTvContainer);
    } catch (error) {
        console.error('Error fetching trending TV shows:', error);
    }
};

// --- Panggil Semua Fungsi Saat Halaman Dimuat ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndBuildCarousel();
    // MODIFIKASI: Memanggil fungsi untuk film horor
    fetchAndShowHorrorMovies();
    fetchAndShowTrendingTv();
});
