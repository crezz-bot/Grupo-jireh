// ==================================================
// JAVASCRIPT PARA INDEX.HTML - GRUPO JIREH
// Optimizado con Carga Perezosa Nativa (Google Friendly)
// Función: Gestión y funcionamiento de carruseles dinámicos
// SOLUCIÓN: Swiper espera a que las fotos estén listas antes de calcular
// AJUSTE: Reflejos/efectos reducidos solo un poco
// NUEVO: Menú de navegación cambia al hacer scroll
// ==================================================


/**
 * Función: elegirFotosAlAzar
 * Propósito: Selecciona una cantidad específica de fotos al azar desde una lista completa
 * @param {Array} lista - Array que contiene todos los objetos de fotos disponibles
 * @param {number} cantidad - Número de fotos que queremos obtener al final
 * @returns {Array} Devuelve un nuevo array con las fotos seleccionadas al azar
 */
function elegirFotosAlAzar(lista, cantidad) {
    // Paso 1: Filtramos la lista original para quedarnos SOLO con fotos válidas
    // Verificamos que tengan una ruta de imagen definida y que no esté vacía
    const validas = lista.filter(p => p.src && p.src !== "");

    // PASO MODIFICADO: Si hay menos fotos de las que pedimos, usa todas las que hayan
    // Esto evita errores si por error pides más fotos de las que existen
    if (validas.length < cantidad) {
        console.warn(`Solo hay ${validas.length} fotos válidas, se usarán todas`);
        cantidad = validas.length;
    }

    // Paso 2: Mezclamos las fotos válidas de forma aleatoria
    // Usamos el operador de propagación (...) para crear una copia de la lista y no modificar la original
    // El método sort() con la resta 0.5 - Math.random() genera un orden totalmente aleatorio
    const mezcla = [...validas].sort(() => 0.5 - Math.random());

    // Paso 3: Devolvemos solo la cantidad de fotos que solicitó el usuario
    // slice(0, cantidad) corta el array desde el inicio hasta el número indicado
    return mezcla.slice(0, cantidad);
}


/**
 * Función: inyectarFotos
 * Propósito: Inserta las imágenes y su información dentro del código HTML de forma dinámica
 * @param {string} idContenedor - El ID del elemento HTML donde se colocarán las fotos
 * @param {Array} listaFotos - Array con las fotos ya filtradas y listas para mostrar
 */
function inyectarFotos(idContenedor, listaFotos) {
    // Paso 1: Buscamos el contenedor principal en el HTML usando su ID
    const contenedor = document.getElementById(idContenedor);
    
    // Si el contenedor no existe en la página, terminamos la función para evitar errores
    if (!contenedor) return;

    // Paso 2: Buscamos el elemento "swiper-wrapper" (es el contenedor interno que mueve las fotos)
    let wrapper = contenedor.querySelector('.swiper-wrapper');

    // Si el contenedor interno NO existe, lo creamos manualmente y lo agregamos al HTML
    if (!wrapper) {
        wrapper = document.createElement('div'); // Creamos un elemento <div> nuevo
        wrapper.className = 'swiper-wrapper'; // Le asignamos la clase necesaria para Swiper
        contenedor.appendChild(wrapper); // Lo agregamos como hijo del contenedor principal
    }

    // Paso 3: Limpiamos todo el contenido que tuviera antes el contenedor interno
    // Esto es importante para que no se repitan fotos si se recarga o ejecuta la función varias veces
    wrapper.innerHTML = ''; 

    // PASO NUEVO: Verificamos que realmente haya fotos para agregar
    if (listaFotos.length === 0) {
        wrapper.innerHTML = '<div class="swiper-slide"><p>No hay fotos disponibles por el momento</p></div>';
        console.error(`No hay fotos para insertar en el contenedor ${idContenedor}`);
        return;
    }

    // Paso 4: Recorremos cada foto de la lista y creamos su código HTML correspondiente
    listaFotos.forEach(foto => {
        // Creamos el elemento que contendrá cada foto (llamado "slide" en Swiper)
        const slide = document.createElement('div');
        slide.className = 'swiper-slide'; // Asignamos la clase obligatoria de Swiper

        // Insertamos el código HTML dentro del slide creado
        slide.innerHTML = `
            <!-- Etiqueta de imagen con optimizaciones -->
            <img src="${foto.src}" 
                 alt="${foto.titulo}" 
                 loading="lazy"
                 onerror="this.src='imagen/grupo-jireh-logo.png'">
            
            <!-- Capa de información que se superpone a la imagen -->
            <div class="overlay-info">
                <h4>${foto.titulo}</h4>
                <p>GRUPO JIREH</p>
            </div>
        `;

        // Agregamos el slide completo al contenedor interno
        wrapper.appendChild(slide);
    });

    // PASO NUEVO: Avisamos que este contenedor ya terminó de cargar sus fotos
    contenedor.dataset.cargado = "true";
}


/**
 * Función: activarCarruseles
 * Propósito: Configura y pone en funcionamiento los dos carruseles de la página
 * Define todos los efectos, comportamientos y controles de cada uno
 */
function activarCarruseles() {
    // -------------------------------------------------------------------------
    // --- CONFIGURACIÓN DEL PRIMER CARRUSEL: EFECTO 3D (ESTILO COVERFLOW) ---
    // -------------------------------------------------------------------------
    // Buscamos el contenedor del primer carrusel en el HTML mediante su ID
    const carrusel3d = document.getElementById('carrusel-proyectos-3d');

    // Solo configuramos si el contenedor existe para evitar errores
    if (carrusel3d) {
        // Inicializamos Swiper pasándole el contenedor y sus configuraciones
        new Swiper(carrusel3d, {
            effect: 'coverflow',        // Tipo de efecto visual: crea profundidad y apariencia 3D
            grabCursor: true,           // Cambia el puntero del ratón a una mano al pasar por encima
            centeredSlides: true,       // Siempre deja la foto principal centrada en la pantalla
            slidesPerView: 'auto',      // Calcula automáticamente cuántas fotos caben según su tamaño
            loop: true,                 // Hace que el carrusel sea infinito: cuando termina vuelve al inicio
            
            // CONFIGURACIÓN CLAVE PARA TU PROBLEMA:
            // Espera a que las imágenes se carguen antes de calcular tamaños
            preloadImages: true,        // Carga las imágenes antes de iniciar
            updateOnImagesReady: true,   // Recalcula todo cuando las imágenes están listas

            // Configuración de reproducción automática
            autoplay: { 
                delay: 2500,            // Tiempo que se muestra cada foto: 2.5 segundos
                disableOnInteraction: false 
                                        // No detiene la reproducción automática aunque el usuario interactúe
            },
            
            // PARTE MODIFICADA: Valores ajustados para reducir reflejos y efecto, solo un poco
            coverflowEffect: {
                rotate: 25,             // ANTES: 40 | AHORA: 25 👉 Menor ángulo = menos inclinación y reflejo
                stretch: 0,              // Sin cambios: espacio entre fotos
                depth: -80,             // ANTES: -150 | AHORA: -80 👉 Menos profundidad = se ven menos lejos y con menos sombra
                modifier: 1.2,          // ANTES: 1.8 | AHORA: 1.2 👉 Menor intensidad = efecto más suave en general
                slideShadows: true,      // Seguimos activándolo para que sigan habiendo reflejos, pero más suaves
                // Si algún día los quieres quitar del todo, cambia "true" por "false"
            },
            
            // Configuración de la paginación (los puntitos debajo del carrusel)
            pagination: {
                el: '#carrusel-proyectos-3d .swiper-pagination',
                clickable: true,
            },

            // Configuración de los botones de navegación (anterior/siguiente)
            navigation: {
                nextEl: '#carrusel-proyectos-3d .swiper-button-next',
                prevEl: '#carrusel-proyectos-3d .swiper-button-prev'
            }
        });
    }


    // ---------------------------------------------------------------------
    // --- CONFIGURACIÓN DEL SEGUNDO CARRUSEL: ESTÁNDAR (ESTILO TARJETA) ---
    // ---------------------------------------------------------------------
    // Buscamos el contenedor del segundo carrusel en el HTML mediante su clase
    const carruselNormal = document.querySelector('.mySwiper');

    // Solo configuramos si el contenedor existe para evitar errores
    if (carruselNormal) {
        // Inicializamos Swiper pasándole el contenedor y sus configuraciones
        new Swiper('.mySwiper', {
            slidesPerView: 1,        // Por defecto muestra 1 sola foto (ideal para pantallas móviles)
            spaceBetween: 25,       // Espacio en píxeles entre cada foto
            loop: true,             // Hace que el carrusel sea infinito: cuando termina vuelve al inicio
            
            // CONFIGURACIÓN CLAVE PARA TU PROBLEMA:
            // Espera a que las imágenes se carguen antes de calcular tamaños
            preloadImages: true,        // Carga las imágenes antes de iniciar
            updateOnImagesReady: true,   // Recalcula todo cuando las imágenes están listas

            // Configuración de reproducción automática
            autoplay: { 
                delay: 3000,         // Tiempo que se muestra cada foto: 3 segundos
                disableOnInteraction: false 
            },
            
            // Configuración RESPONSIVA: cambia la cantidad de fotos según el tamaño de pantalla
            breakpoints: {
                640: { slidesPerView: 2 },   // En pantallas ≥ 640px muestra 2 fotos a la vez
                1024: { slidesPerView: 3 }   // En pantallas ≥ 1024px muestra 3 fotos a la vez
            },
            
            // Configuración de los botones de navegación (anterior/siguiente)
            navigation: {
                nextEl: '.mySwiper .swiper-button-next',
                prevEl: '.mySwiper .swiper-button-prev',
            },

            // Configuración de la paginación (los puntitos debajo del carrusel)
            pagination: {
                el: '.mySwiper .swiper-pagination',
                clickable: true,
            }
        });
    }
}


// ==================================================
// FUNCIONALIDAD DEL BOTÓN "VOLVER ARRIBA"
// ==================================================

// Detecta cuando el usuario desplaza la página hacia arriba o abajo
window.onscroll = function() {
    // --- CÓDIGO DEL BOTÓN VOLVER ARRIBA ---
    const btn = document.getElementById("btnVolverArriba");
    if (btn) {
        btn.style.display = (window.scrollY > 400) ? "block" : "none";
    }

    // --- CÓDIGO DE LA BARRA DE NAVEGACIÓN (TU CÓDIGO NUEVO) ---
    const nav = document.querySelector('.navbar');
    // Verificamos que el menú exista antes de modificarlo para evitar errores
    if (nav) {
        // Si bajamos más de 80 píxeles, agregamos la clase "scrolled"
        if (window.scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
};


/**
 * Función: volverArriba
 * Propósito: Lleva al usuario al inicio de la página con desplazamiento suave
 * Se ejecuta al hacer clic sobre el botón correspondiente
 */
function volverArriba() {
    window.scrollTo({ 
        top: 0,              // Posición objetivo: inicio de la página
        behavior: 'smooth'   // Tipo de desplazamiento: suave y progresivo
    });
}


// ==================================================
// INICIO DE TODO EL PROGRAMA
// Se ejecuta automáticamente cuando todo el HTML está cargado y listo
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Verificamos que la base de datos externa de fotos exista y esté disponible
    if (typeof galeriaProyectos !== 'undefined') {
        // Obtenemos fotos al azar - AHORA SE AJUSTAN AUTOMÁTICAMENTE SI HAY MENOS
        const fotos3D = elegirFotosAlAzar(galeriaProyectos, 40);
        const fotosNormal = elegirFotosAlAzar(galeriaProyectos, 35);
        
        // Insertamos las fotos obtenidas en sus respectivos contenedores del HTML
        inyectarFotos('carrusel-proyectos-3d', fotos3D);
        inyectarFotos('wrapper-carrusel-card', fotosNormal);

        // Esperamos un momento breve para asegurar que las fotos se hayan insertado antes de activar Swiper
        setTimeout(() => {
            activarCarruseles();
        }, 100);
    } else {
        console.error('La lista de fotos "galeriaProyectos" no está definida');
    }
});
