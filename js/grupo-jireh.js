/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🏢 PROYECTO: GRUPO JIREH
 * 📄 ARCHIVO: Carruseles Interactivos Autónomos (MARCO DE GALA RESALTADOR)
 * 🎯 FUNCIÓN: Carrusel 3D Orbital con Contraste Central Mejorado (CORREGIDO)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// 🛠️ COMPATIBILIDAD: Animación fluida en navegadores antiguos
window.requestAnimationFrame = window.requestAnimationFrame || function(callback) {
    return setTimeout(callback, 1000 / 60);
};

document.addEventListener('DOMContentLoaded', () => {

    // ==================================================
    // ⚙️ CONFIGURACIÓN GENERAL CALIBRADA
    // ==================================================
    const CONFIG = {
        GLOBAL: {
            IMAGEN_REPUESTO: 'ruta/a/imagen-de-repuesto.jpg' 
        },
        CARRUSEL_3D: {
            CANTIDAD_MAXIMA: 6,        
            TIEMPO_CAMBIO: 3500,       
            ACTIVO: true               
        },
        CARRUSEL_SIMPLE: {
            VELOCIDAD: 0.5,            
            ACTIVO: true,              
            ANCHO_ITEM_ESCRITORIO: 240,
            ALTO_ITEM_ESCRITORIO: 300,
            ANCHO_ITEM_CELULAR: 150,   
            ALTO_ITEM_CELULAR: 210,
            ESPACIADO: 20,             
            ESPACIADO_CELULAR: 12      
        },
        ES_CELULAR: window.innerWidth < 768,
        PUNTO_CAMBIO: 768           
    };

    // 🔀 FUNCIÓN: Mezclar las fotos aleatoriamente
    function mezclarProyectos(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // ⚠️ COMPROBACIÓN DE SEGURIDAD
    if (typeof galeriaProyectos === 'undefined' || !Array.isArray(galeriaProyectos) || galeriaProyectos.length === 0) {
        console.error('❌ ERROR GLOBAL: La variable galeriaProyectos no existe o está vacía');
        return;
    }
    
    const proyectosMezclados = mezclarProyectos(
        galeriaProyectos.filter(foto => foto.src && foto.src.trim() !== '' && !foto.src.includes('logo'))
    );

    // ==================================================
    // 🎠 COMPONENTE 1: CARRUSEL 3D
    // ==================================================
    const Carrusel3D = {
        contenedor: document.getElementById('carrusel-proyectos-3d'), 
        listaDeProyectos: [], 
        tarjetas: [], 
        indiceActual: 0, 
        rotacionActual: 0, 
        ultimoTiempo: Date.now(), 
        ultimaPosicionTouch: null, 
        estaArrastrando: false,

        iniciar() {
            if (!this.contenedor) return;

            this.listaDeProyectos = proyectosMezclados.slice(0, CONFIG.CARRUSEL_3D.CANTIDAD_MAXIMA);
            if (this.listaDeProyectos.length === 0) return;

            this.contenedor.className = CONFIG.ES_CELULAR ? 'carrusel-3d-contenedor celular' : 'carrusel-3d-contenedor escritorio';

            const alturaEje = CONFIG.ES_CELULAR ? '170px' : '310px'; 
            const anchoEje = CONFIG.ES_CELULAR ? '120px' : '240px'; 
            const perspectivaActual = CONFIG.ES_CELULAR ? '800px' : '1500px'; 

            this.contenedor.style = `
                position: relative;
                width: ${anchoEje};
                height: ${alturaEje};
                margin: 80px auto 100px auto;
                perspective: ${perspectivaActual};
                transform-style: preserve-3d;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.92);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                border-radius: 16px;
                overflow: visible;
                box-shadow: 0 0 60px rgba(0, 0, 0, 0.95), 0 0 40px rgba(0, 217, 255, 0.25);
                border: 1px solid rgba(255, 255, 255, 0.08);
            `;

            this.crearTarjetasIniciales(); 
            this.configurarPausa(); 
            this.animar(); 
            
            window.addEventListener('resize', () => {
                CONFIG.ES_CELULAR = window.innerWidth < CONFIG.PUNTO_CAMBIO;
                this.contenedor.className = CONFIG.ES_CELULAR ? 'carrusel-3d-contenedor celular' : 'carrusel-3d-contenedor escritorio';
                this.contenedor.style.height = CONFIG.ES_CELULAR ? '170px' : '310px';
                this.contenedor.style.width = CONFIG.ES_CELULAR ? '120px' : '240px';
                this.actualizarPosiciones(); 
            });
        },

        crearTarjetasIniciales() {
            this.contenedor.innerHTML = ''; 

            this.listaDeProyectos.forEach((foto, numero) => {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'tarjeta-3d';
                tarjeta.dataset.numero = numero; 

                const anchoUsar = CONFIG.ES_CELULAR ? 100 : 200;
                const altoUsar = CONFIG.ES_CELULAR ? 145 : 280;

                tarjeta.style = `
                    position: absolute;
                    width: ${anchoUsar}px;
                    height: ${altoUsar}px;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease;
                    -webkit-box-reflect: below 6px linear-gradient(to bottom, rgba(0,0,0,0) 80%, rgba(0,0,0,0.15) 100%);
                    background: #000;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.6);
                    backface-visibility: hidden; /* 🚨 Corregido para evitar transparencias raras por detrás */
                    -webkit-backface-visibility: hidden;
                `;

                tarjeta.innerHTML = `
                    <img src="${foto.src}" alt="${foto.titulo}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="titulo-proyecto" style="
                        position: absolute;
                        bottom: 0;
                        width: 100%;
                        padding: 12px 8px;
                        background: linear-gradient(to top, rgba(0,0,0,0.95), transparent);
                        color: white;
                        text-align: center;
                        font-weight: 500;
                        font-size: ${CONFIG.ES_CELULAR ? '11px' : '13px'};
                    ">${foto.titulo}</div>
                `;
                this.contenedor.appendChild(tarjeta); 
            });

            this.tarjetas = this.contenedor.querySelectorAll('.tarjeta-3d'); 
            this.validarImagenesRotas(); 
            this.actualizarPosiciones(); 
        },

        validarImagenesRotas() {
            this.tarjetas.forEach((tarjeta) => {
                const img = tarjeta.querySelector('img');
                img.addEventListener('error', () => {
                    img.src = CONFIG.GLOBAL.IMAGEN_REPUESTO; 
                });
            });
        },

        configurarPausa() {
            this.contenedor.addEventListener('mouseenter', () => CONFIG.CARRUSEL_3D.ACTIVO = false);
            this.contenedor.addEventListener('mouseleave', () => {
                if (!this.estaArrastrando) {
                    CONFIG.CARRUSEL_3D.ACTIVO = true;
                    this.ultimoTiempo = Date.now(); 
                }
            });

            this.contenedor.addEventListener('mousedown', (e) => {
                this.estaArrastrando = true;                                     
                this.contenedor.style.cursor = 'grabbing';        
                this.ultimaPosicionTouch = e.clientX;             
            });

            window.addEventListener('mousemove', (e) => {
                if (!this.estaArrastrando) return;                                
                const deltaX = e.clientX - this.ultimaPosicionTouch;
                this.rotacionActual = this.rotacionActual + (deltaX * 0.4); 
                this.actualizarPosiciones();                                      
                this.ultimaPosicionTouch = e.clientX;             
            });

            window.addEventListener('mouseup', () => {
                if (!this.estaArrastrando) return;                                
                this.estaArrastrando = false;                                     
                this.contenedor.style.cursor = 'pointer';         
                this.finalizarArrastre();                                         
            });

            this.contenedor.addEventListener('touchstart', (e) => {
                CONFIG.CARRUSEL_3D.ACTIVO = false;                                
                this.estaArrastrando = true;                                     
                this.ultimaPosicionTouch = e.touches[0].clientX;  
            }, {passive: true});                                                  

            this.contenedor.addEventListener('touchmove', (e) => {
                if (!this.estaArrastrando) return;                                
                const deltaX = e.touches[0].clientX - this.ultimaPosicionTouch;
                this.rotacionActual = this.rotacionActual + (deltaX * 0.4); 
                this.actualizarPosiciones();                                      
                this.ultimaPosicionTouch = e.touches[0].clientX;  
            }, {passive: true});

            this.contenedor.addEventListener('touchend', () => {
                if (!this.estaArrastrando) return;                                
                this.estaArrastrando = false;                                     
                this.finalizarArrastre();                                         
            }, {passive: true});
        },

        finalizarArrastre() {
            this.ultimaPosicionTouch = null;                                      
            const total = this.tarjetas.length;                                   
            const gradosPorTarjeta = 360 / total;                                 
            
            this.indiceActual = Math.round(-this.rotacionActual / gradosPorTarjeta) % total;
            if (this.indiceActual < 0) this.indiceActual += total;
            
            this.rotacionActual = -this.indiceActual * gradosPorTarjeta;
            this.actualizarPosiciones();                                          

            CONFIG.CARRUSEL_3D.ACTIVO = true;
            this.ultimoTiempo = Date.now();                                       
        },

        actualizarPosiciones() {
            const total = this.tarjetas.length; 
            const radioX = CONFIG.ES_CELULAR ? 120 : 320; 
            const radioZ = CONFIG.ES_CELULAR ? 140 : 360; 
            const gradosPorTarjeta = 360 / total;

            this.tarjetas.forEach((tarjeta, i) => {
                // Cálculo del ángulo base de cada tarjeta en el círculo orbital
                const anguloTarjeta = (i * gradosPorTarjeta) + this.rotacionActual;
                const anguloRadianes = anguloTarjeta * Math.PI / 180;

                // Coordenadas espaciales en base al radio configurado
                const posX = Math.sin(anguloRadianes) * radioX;
                const posZ = Math.cos(anguloRadianes) * radioZ;
                
                // 🚨 CORRECCIÓN MATEMÁTICA: La tarjeta rota sobre su eje Y exactamente igual a su ángulo orbital
                // Esto hace que siempre miren hacia el frente/centro y evita que se queden de perfil.
                const rotacionY = anguloTarjeta; 

                const zIndexEfectivo = Math.round(posZ + 500); 
                const opacidadEfectiva = posZ < 0 ? 0.35 : 1;
                const escalaEfectiva = posZ < 0 ? 0.75 : 1.05; 

                tarjeta.style.zIndex = zIndexEfectivo;
                tarjeta.style.opacity = opacidadEfectiva;
                tarjeta.style.transform = `translateX(${posX}px) translateZ(${posZ}px) rotateY(${rotacionY}deg) scale(${escalaEfectiva})`;

                if (posZ > (radioZ * 0.8) && Math.abs(posX) < 40) {
                    tarjeta.classList.add('destacada');
                    tarjeta.style.boxShadow = '0 25px 50px rgba(0, 217, 255, 0.6)';
                    tarjeta.style.border = '1px solid rgba(0, 217, 255, 0.7)';
                } else {
                    tarjeta.classList.remove('destacada');
                    tarjeta.style.boxShadow = '0 10px 25px rgba(0,0,0,0.6)';
                    tarjeta.style.border = 'none';
                }
            });
        },

        animar() {
            if (CONFIG.CARRUSEL_3D.ACTIVO) {
                const tiempoAhora = Date.now();
                if (tiempoAhora - this.ultimoTiempo >= CONFIG.CARRUSEL_3D.TIEMPO_CAMBIO) {
                    this.indiceActual = (this.indiceActual + 1) % this.tarjetas.length; 
                    const gradosPorTarjeta = 360 / this.tarjetas.length;
                    this.rotacionActual = -this.indiceActual * gradosPorTarjeta;

                    this.actualizarPosiciones(); 
                    this.ultimoTiempo = tiempoAhora; 
                }
            }
            requestAnimationFrame(() => this.animar()); 
        }
    };

    // ==================================================
    // 🎠 COMPONENTE 2: CARRUSEL SIMPLE DESLIZANTE
    // ==================================================
    const CarruselSimple = {
        contenedor: document.getElementById('carrusel-simple'),
        listaDeProyectos: [],
        desplazamientoActual: 0, 
        bucleIniciado: false, 

        iniciar() {
            if (!this.contenedor) return;

            this.listaDeProyectos = proyectosMezclados; 
            if (this.listaDeProyectos.length === 0) return;

            this.bucleIniciado = false; 
            this.desplazamientoActual = 0;
            this.contenedor.scrollLeft = 0;

            const gapUsar = CONFIG.ES_CELULAR ? CONFIG.CARRUSEL_SIMPLE.ESPACIADO_CELULAR : CONFIG.CARRUSEL_SIMPLE.ESPACIADO;
            const altoContenedor = CONFIG.ES_CELULAR ? CONFIG.CARRUSEL_SIMPLE.ALTO_ITEM_CELULAR + 50 : CONFIG.CARRUSEL_SIMPLE.ALTO_ITEM_ESCRITORIO + 50;

            this.contenedor.style = `
                display: flex;
                gap: ${gapUsar}px;
                overflow-x: hidden; 
                padding: 20px 0;
                width: 100%;
                height: ${altoContenedor}px;
                align-items: center;
                border-radius: 10px;
                max-width: 1000px;
                margin: 0 auto;
            `;

            this.mostrarElementos();
            this.aplicarModoOscuro(); 

            this.bucleIniciado = true;
            this.configurarPausa(); 
            this.animarMovimiento(); 
        },

        mostrarElementos() {
            this.contenedor.innerHTML = '';

            const anchoItem = CONFIG.ES_CELULAR ? CONFIG.CARRUSEL_SIMPLE.ANCHO_ITEM_CELULAR : CONFIG.CARRUSEL_SIMPLE.ANCHO_ITEM_ESCRITORIO;
            const altoItem = CONFIG.ES_CELULAR ? CONFIG.CARRUSEL_SIMPLE.ALTO_ITEM_CELULAR : CONFIG.CARRUSEL_SIMPLE.ALTO_ITEM_ESCRITORIO;
            const altoImg = CONFIG.ES_CELULAR ? '160px' : '240px';

            this.listaDeProyectos.forEach((foto) => {
                const elemento = document.createElement('div');
                elemento.className = 'item-simple';

                elemento.style = `
                    min-width: ${anchoItem}px;
                    height: ${altoItem}px;
                    flex-shrink: 0; 
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
                    -webkit-box-reflect: below 5px linear-gradient(to bottom, rgba(0,0,0,0.0) 75%, rgba(0,0,0,0.15) 100%);
                `;

                elemento.innerHTML = `
                    <img src="${foto.src}" alt="${foto.titulo}" style="width: 100%; height: ${altoImg}; object-fit: cover;">
                    <p style="
                        padding: 8px;
                        margin: 0;
                        text-align: center;
                        font-weight: 500;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis; 
                    ">
                        ${foto.titulo}
                    </p>
                `;
                this.contenedor.appendChild(elemento);
            });
        },

        aplicarModoOscuro() {
            const esModoOscuro = !document.body.classList.contains('modo-claro');
            this.contenedor.style.backgroundColor = esModoOscuro ? '#1a1a2e' : '#f8f9fa';
            
            this.contenedor.querySelectorAll('.item-simple').forEach(item => {
                item.style.backgroundColor = esModoOscuro ? '#252540' : '#fff';
                item.querySelector('p').style.color = esModoOscuro ? '#fff' : '#333';
            });
        },

        configurarPausa() {
            this.contenedor.addEventListener('mouseenter', () => CONFIG.CARRUSEL_SIMPLE.ACTIVO = false);
            this.contenedor.addEventListener('mouseleave', () => CONFIG.CARRUSEL_SIMPLE.ACTIVO = true);
            
            this.contenedor.addEventListener('touchstart', () => CONFIG.CARRUSEL_SIMPLE.ACTIVO = false, {passive: true});
            this.contenedor.addEventListener('touchend', () => CONFIG.CARRUSEL_SIMPLE.ACTIVO = true, {passive: true});
        },

        animarMovimiento() {
            if (!this.bucleIniciado) return; 

            if (CONFIG.CARRUSEL_SIMPLE.ACTIVO) {
                const anchoTotal = this.contenedor.scrollWidth; 
                const anchoVisible = this.contenedor.clientWidth; 

                this.desplazamientoActual += CONFIG.CARRUSEL_SIMPLE.VELOCIDAD; 

                if (this.desplazamientoActual >= (anchoTotal - anchoVisible - 1)) {
                    CONFIG.CARRUSEL_SIMPLE.ACTIVO = false; 
                    this.contenedor.style.transition = 'scroll-left 0.8s ease'; 
                    this.contenedor.scrollLeft = 0; 
                    
                    setTimeout(() => {
                        this.contenedor.style.transition = 'none';
                        this.desplazamientoActual = 0;
                        CONFIG.CARRUSEL_SIMPLE.ACTIVO = true; 
                    }, 800);
                } else {
                    this.contenedor.scrollLeft = this.desplazamientoActual; 
                }
            }
            requestAnimationFrame(() => this.animarMovimiento());
        }
    };

    // 🚀 INICIALIZACIÓN
    Carrusel3D.iniciar();
    CarruselSimple.iniciar();

    // 👁️ OBSERVADOR DE TEMA CONFIGURADO EN EL BODY
    let temaActualClaro = document.body.classList.contains('modo-claro');
    const observadorTema = new MutationObserver(() => {
        const nuevoTemaClaro = document.body.classList.contains('modo-claro');
        if (nuevoTemaClaro !== temaActualClaro) {
            CarruselSimple.aplicarModoOscuro(); 
            temaActualClaro = nuevoTemaClaro;
        }
    });
    observadorTema.observe(document.body, { attributes: true, attributeFilter: ['class'] });

});

// 📜 MENÚ SEGUIDOR (Control de visibilidad al hacer scroll)
window.addEventListener('scroll', () => {
    const acompañante = document.getElementById('menuSeguidor');
    if (acompañante) {
        if (window.scrollY > 150) {
            acompañante.classList.add('activo');
        } else {
            acompañante.classList.remove('activo');
        }
    }
}); 

// 🌗 CONTROL GLOBAL DEL MODO OSCURO / CLARO
// ✅ Escucha clics en CUALQUIER elemento que tenga el ID o las clases de los botones de modo.
document.addEventListener('click', (e) => {
    if (e.target.id === 'boton-color' || e.target.closest('#boton-color') || e.target.closest('.btn-menu-seguidor') || e.target.closest('.btn-modo')) {
        document.body.classList.toggle('modo-claro');
    }
});
