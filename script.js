// Data film sampel (dalam aplikasi nyata, ini akan berasal dari server/API)
const movies = [
    {
        name: 'Loki',
        des: 'Setelah mencuri Tesseract, Loki mendapati dirinya berada dalam masalah dengan Otoritas Varians Waktu birokrasi, memaksanya untuk memperbaiki garis waktu.',
        image: 'images/slider2.png'
    },
    {
        name: 'The Falcon and The Winter Soldier',
        des: 'Falcon dan Winter Soldier bekerja sama dalam petualangan global yang menguji kemampuan dan kesabaran mereka.',
        image: 'images/slider1.png'
    },
    {
        name: 'WandaVision',
        des: 'Wanda Maximoff dan Vision—dua makhluk super yang menjalani kehidupan pinggiran kota yang ideal—mulai curiga bahwa semuanya tidak seperti yang terlihat.',
        image: 'images/slider3.png'
    },
    {
        name: 'Raya and the Last Dragon',
        des: 'Di dunia fantasi Kumandra, seorang pejuang bernama Raya bertekad untuk menemukan naga terakhir untuk menyelamatkan dunia.',
        image: 'images/slider4.png'
    },
    {
        name: 'Luca',
        des: 'Di Riviera Italia, sebuah persahabatan yang tak terlupakan tumbuh antara seorang manusia dan monster laut yang menyamar sebagai manusia.',
        image: 'images/slider5.png'
    }
];

const carousel = document.querySelector('.carousel');
let sliders = [];
let slideIndex = 0; // untuk melacak slide saat ini

const createSlide = () => {
    // Memberikan efek reset jika slide sudah mencapai akhir
    if (slideIndex >= movies.length) {
        slideIndex = 0;
    }

    // Membuat Elemen DOM
    let slide = document.createElement('div');
    let imgElement = document.createElement('img');
    let content = document.createElement('div');
    let h1 = document.createElement('h1');
    let p = document.createElement('p');

    // Mengambil dan menempelkan data
    h1.appendChild(document.createTextNode(movies[slideIndex].name));
    p.appendChild(document.createTextNode(movies[slideIndex].des));
    imgElement.src = movies[slideIndex].image;
    
    // Menyusun elemen
    content.appendChild(h1);
    content.appendChild(p);
    slide.appendChild(content);
    slide.appendChild(imgElement);
    carousel.appendChild(slide);

    // Menambahkan kelas CSS
    slide.className = 'slider';
    content.className = 'slide-content';
    h1.className = 'movie-title';
    p.className = 'movie-des';

    sliders.push(slide);

    // Efek geser slide
    if (sliders.length) {
        sliders[0].style.marginLeft = `calc(-${100 * (sliders.length - 2)}% - ${30 * (sliders.length - 2)}px)`;
    }

    slideIndex++;
}

// Membuat slide awal
for (let i = 0; i < 3; i++) {
    createSlide();
}

// Mengganti slide setiap 3 detik
setInterval(() => {
    createSlide();
}, 3000);
