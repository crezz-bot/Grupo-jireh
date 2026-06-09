document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('nuestros-productos');

    // 1. Función para revolver el array (Algoritmo Fisher-Yates)
    function mezclarProyectos(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function cargarCarruselAleatorio() {
        wrapper.innerHTML = ''; // Limpiamos
        wrapper,inicializarSwiper(); // Reiniciamos Swiper para evitar conflictos

        // 2. Mezclamos una copia del array original
        const proyectosMezclados = mezclarProyectos([...galeriaProyectos]);

        proyectosMezclados.forEach(proyecto => {
            if (proyecto.src && proyecto.src !== '') { // Evita rutas vacías
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                
                slide.innerHTML = `
                    <div class="card-proyecto">
                        <img src="${proyecto.src}" alt="${proyecto.titulo}" loading="lazy">
                        <div class="info-proyecto">
                            <h4>${proyecto.titulo}</h4>
                            <p>${proyecto.categoria.replace(/-/g, ' ')}</p>
                        </div>
                    </div>
                `;
                wrapper.appendChild(slide);
            }
        });

        // 3. Inicializamos Swiper después de cargar las imágenes
        inicializarSwiper();
    }

    function inicializarSwiper() {
        new Swiper('.swiper-container', {
            loop: true,
            grabCursor: true, // Cambia el cursor a una mano para "arrastrar"
            centeredSlides: false,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            slidesPerView: 1,
            spaceBetween: 20,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1440: { slidesPerView: 4 }
            }
        });
    }

    cargarCarruselAleatorio();

// Iniciar
    generarShowroomInmersivo();
});
