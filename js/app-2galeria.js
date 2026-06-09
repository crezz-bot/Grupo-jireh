/**
 * ============================================================================
 * GALERÍA 3D INTEGRAL - GRUPO JIREH 2026
 * 🚀 VERSIÓN ULTRA-INMERSIVA: EFECTO PANTALLA CURVA / CABINA DE CINE
 * ============================================================================
 */

(() => {

    // ==============================================
    // 🔧 CONFIGURACIÓN CENTRALIZADA & IMAX 360°
    // ==============================================
    const CONFIG = {
        CARRUSEL: {
            TOTAL_ELEMENTOS: 30,           // 📈 30 fotos para que el anillo sea denso y lleno
            SEPARACION_ANGULAR: 12,        // 📐 30 * 12 = 360° perfectos sin huecos
            RADIO_BASE: 480,               // 🎡 Curva agresiva hacia el fondo
            RADIO_MIN: 350,
            RADIO_MAX: 1500,
            VELOCIDAD_ROTACION: 2.0,       
            VELOCIDAD_RAPIDA: 6,            
            VELOCIDAD_ROTACION_MOUSE: 0.08, 
            ANCHO_PANEL: 110,              
            ALTO_PANEL: 210,
            PROFUNDIDAD_FONDO: 0,
            DESPLAZAMIENTO_REFLEJO_Y:   288, 
            RADIO_REFLEJO: 475, 
            OPACIDAD_REFLEJO: 0.65         
        },
        VISUAL: {
            PERSPECTIVA: 550,              // 🎥 Máxima profundidad de túnel
            TRANSICION_ESCENA: 800,
            TRANSICION_PANEL: 200,
            BRIGHTNESS_MIN: 0.20,          // 🌗 Oscurece el fondo de forma realista
            BRIGHTNESS_MAX: 1.0,
            OPACITY_MIN: 0.25,             // 👁️ Desvanecimiento atmosférico
            OPACITY_MAX: 1.0
        },
        GRID: {
            COLUMNAS: 4,
            COLUMNAS_MOVIL: 2
        }
    };

    const elementosDOM = {
        contenedorPaneles: validarElemento('vr-carrusel-paneles'),
        contenedorReflejos: validarElemento('vr-carrusel-reflejos'),
        escenaShowroom: validarElemento('escena-showroom-3d'),
        galeriaCuadratica: validarElemento('galeria-cuadratica-estatica'),
        contenedorGrid: validarElemento('contenedor-grid-limpio'),
        fotoModal: validarElemento('fotoModal'),
        imgFull: validarElemento('imgFull'),
        btnVolver: validarElemento('btn-volver-carrusel'),
        contenedorEscena: validarElemento('contenedor-escena-inmersiva')
    };

    // ==============================================
    // 📊 ESTADO GLOBAL
    // ==============================================
    const estado = {
        angulo: 0,
        modoCarrusel: true,
        elementosActivos: [],
        rotacionManual: false,
        posicionMouseX: 0,
        deltaMouse: 0,      
        inercia: 0,         
        radioActual: CONFIG.CARRUSEL.RADIO_BASE,
        galeriaCargada: true,
        controlesActivados: false,
        velocidadActual: CONFIG.CARRUSEL.VELOCIDAD_ROTACION,
        ultimoTiempo: 0,
        idAnimacionFrame: null
    };

    function validarElemento(id) {
        const elemento = document.getElementById(id);
        if (!elemento) console.warn(`⚠️ Elemento con ID "${id}" no encontrado`);
        return elemento;
    }

    function mezclarArray(array) {
        const nuevoArray = [...array];
        for (let i = nuevoArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nuevoArray[i], nuevoArray[j]] = [nuevoArray[j], nuevoArray[i]];
        }
        return nuevoArray;
    }

    function calcularEfectos3D(rotacionLocal) {
        const radianes = (rotacionLocal * -Math.PI) / 180;
        const cos = Math.cos(radianes);
        return {
            cos: cos,
            brillo: CONFIG.VISUAL.BRIGHTNESS_MIN + (cos * (CONFIG.VISUAL.BRIGHTNESS_MAX - CONFIG.VISUAL.BRIGHTNESS_MIN)),
            opacidad: CONFIG.VISUAL.OPACITY_MIN + (cos * (CONFIG.VISUAL.OPACITY_MAX - CONFIG.VISUAL.OPACITY_MIN)),
            profundidad: estado.radioActual
        };
    }

    function inicializarProfundidad() {
        if (!elementosDOM.contenedorEscena) return;
        
        elementosDOM.contenedorEscena.style.cssText = `
            perspective: ${CONFIG.VISUAL.PERSPECTIVA}px !important;
            perspective-origin: center 40% !important;
            transform-style: preserve-3d !important;
            height: 90vh !important;
            min-height: 500px !important;
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: relative !important;
            cursor: grab !important;
        `;
    }

    function aplicarEstilosInmersivos() {
        inicializarProfundidad();

        if (elementosDOM.escenaShowroom) {
            elementosDOM.escenaShowroom.style.cssText = `
                position: relative;
                width: 100%;
                height: 100%;
                transform-style: preserve-3d !important;
                justify-content: center;
                align-items: center;
                display: flex;
                background: transparent !important;
            `;
        }

        if (!elementosDOM.contenedorReflejos && elementosDOM.escenaShowroom) {
            elementosDOM.contenedorReflejos = document.createElement('div');
            elementosDOM.contenedorReflejos.id = 'vr-carrusel-reflejos';
            elementosDOM.escenaShowroom.appendChild(elementosDOM.contenedorReflejos);
        }

        if (elementosDOM.contenedorPaneles) {
            elementosDOM.contenedorPaneles.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 1px;  
                height: 1px; 
                transform-style: preserve-3d !important;
                overflow: visible !important;
                z-index: 100;
            `;
        }

        if (elementosDOM.contenedorReflejos) {
            elementosDOM.contenedorReflejos.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 1px;  
                height: 1px; 
                transform-style: preserve-3d !important;
                z-index: 40;
            `;
        }

        let estiloClases = document.getElementById('estilos-galeria-3d-jireh');

        if (!estiloClases) {
            estiloClases = document.createElement('style');
            estiloClases.id = 'estilos-galeria-3d-jireh';
            document.head.appendChild(estiloClases);
        }

        estiloClases.textContent = `
            .contenedor-botones-filtros {
                position: relative !important;
                z-index: 99999 !important; 
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
                padding: 15px;
                pointer-events: auto !important;
            }
            .btn-filtro-2026, .btn-especial {
                position: relative !important;
                z-index: 99999 !important;
                cursor: pointer !important;
                pointer-events: auto !important;
            }
            .mundo-3d-jireh {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                transform-style: preserve-3d !important;
                pointer-events: none;
            }
            
            .mundo-3d-jireh .tarjeta-3d-wrap { pointer-events: auto; }

            /* 🌟 CONTENEDOR MAESTRO DE LA TARJETA */
            .tarjeta-3d-wrap {
                position: absolute;
                width: ${CONFIG.CARRUSEL.ANCHO_PANEL}px;
                height: ${CONFIG.CARRUSEL.ALTO_PANEL}px;
                transform-style: preserve-3d !important;
                overflow: visible !important; 
                perspective: 1000px;
            }

            /* 🖼️ PANEL VERTICAL (PARED DE LA L) */
            .panel {
                position: absolute;
                width: 100%;
                height: 100%;
                transform-style: preserve-3d;
                transition: filter 0.3s, opacity 0.3s;
                cursor: pointer;
                top: 0;
                left: 0;
                border-radius: 1rem;
                box-shadow: 0 0 30px rgba(0,217,255,0.2);
                backface-visibility: visible; 
                transform-origin: center bottom !important; /* Bisagra inferior */
                z-index: 100;
            }
            .panel img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transform: translateZ(10px);
                backface-visibility: hidden;
                border-radius: 1rem;
            }

                 /* 📋 LA CAJA DE INFO REAL (CON LETRAS NEÓN DE ALTA VISIBILIDAD) */
.info-proyecto {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 0.5rem; /* Relleno compacto para que no use mucho espacio */
    background: linear-gradient(to top, rgba(5, 10, 20, 0.95) 40%, transparent 100%);
    transform: translateZ(25px) !important; /* Flota por encima del suelo inclinado */
    border-radius: 0 0 1rem 1rem;
    z-index: 100;
    pointer-events: none;
    text-align: center; /* Centramos el texto para que luzca más ordenado */
}

/* El título del proyecto en Neón Cian brillante */
.info-proyecto h4 {
    font-size: 0.85rem !important; /* Tamaño compacto para evitar las 3 líneas */
    margin: 0 0 0.1rem 0 !important;
    font-weight: 700;
    letter-spacing: 0.5px;
    white-space: nowrap; /* Fuerza una sola línea */
    overflow: hidden;
    text-overflow: ellipsis; /* Pone tres puntos si el nombre es muy largo */
    
    /* 🔥 EFECTO NEÓN CIAN: Texto iluminado que se lee en lo oscuro y lo claro */
    color: #00f3ff !important;
    text-shadow: 
        0 0 4px rgba(0, 243, 255, 0.6),
        0 0 10px rgba(0, 243, 255, 0.4),
        0 0 20px rgba(0, 243, 255, 0.2);
}

/* El texto de la empresa en un Neón Azul/Blanco más sutil */
.info-proyecto p {
    font-size: 0.65rem !important;
    margin: 0 !important;
    font-weight: 600;
    letter-spacing: 1.5px;
    
    /* 🔥 EFECTO ILUMINACIÓN DISCRETA */
    color: #e0faff !important;
    text-shadow: 
        0 0 3px rgba(0, 217, 255, 0.5),
        0 0 8px rgba(0, 217, 255, 0.3);
}

/* 🌗 EL PISO REFLECTANTE CON ÁNGULO CERRADO (REMANENTE) */
.reflejo {
    position: absolute;
    top: 100%;   
    left: 0;
    width: 100%;
    height: 100%; 
    pointer-events: none !important;
    overflow: hidden !important;
    z-index: 20;
    transform-origin: center top !important; 
    transform-style: preserve-3d !important;
    
    background: linear-gradient(to bottom, 
        rgba(10, 15, 30, 0.85) 0%, 
        rgba(0, 217, 255, 0.08) 20%, 
        rgba(0, 0, 0, 0.98) 100%
    );
    
    border-top: 1.5px solid rgba(0, 217, 255, 0.4); 

    -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 95%);
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 95%);
}

.reflejo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0 0 1rem 1rem;
    display: block;
    transform: scaleY(-1) !important;
    opacity: 0.65 !important; 
    filter: brightness(1.1) contrast(1.2) saturate(1.1);
}

/* Sigue ocultando el texto duplicado en el reflejo de abajo para que no se encime */
.reflejo .info-proyecto {
    display: none !important;
}



            @media (max-width: 768px) {
                #contenedor-grid-limpio { grid-template-columns: repeat(${CONFIG.GRID.COLUMNAS_MOVIL}, 1fr); }
                .tarjeta-3d-wrap { width: 150px; height: 180px; }
                .panel { width: 100%; height: 100%; }
                .reflejo { width: 100%; height: ${180 * 0.6}px; }
            }
        `;
    }

    function inicializarEscenario() {
        if (typeof galeriaProyectos === 'undefined') return;

        inicializarProfundidad(); 
        aplicarEstilosInmersivos();

        const fotosMezcladas = mezclarArray([...galeriaProyectos]);
        const fotosSeleccionadas = fotosMezcladas.slice(0, CONFIG.CARRUSEL.TOTAL_ELEMENTOS);

        if (elementosDOM.contenedorPaneles) elementosDOM.contenedorPaneles.innerHTML = '';
        if (elementosDOM.contenedorReflejos) elementosDOM.contenedorReflejos.innerHTML = '';
        
        estado.elementosActivos = [];

        fotosSeleccionadas.forEach((foto, i) => {
            // 🌟 1. CREAMOS EL CONTENEDOR ENVOLTORIO
            const tarjetaWrap = document.createElement('div');
            tarjetaWrap.className = 'tarjeta-3d-wrap';
            tarjetaWrap.dataset.indice = i;
            tarjetaWrap.style.cssText = `
                position: absolute;
                transform-style: preserve-3d;
                width: ${CONFIG.CARRUSEL.ANCHO_PANEL}px;
                height: ${CONFIG.CARRUSEL.ALTO_PANEL}px;
            `;

            // 🖼️ 2. CREAMOS EL PANEL (Hermano 1)
            const panel = document.createElement('div');
            panel.className = 'panel';
            panel.style.transformStyle = 'preserve-3d';

            const img = document.createElement('img');
            img.src = foto.src;
            img.alt = foto.titulo;
            img.loading = 'eager';
            img.decoding = 'async';
            panel.appendChild(img);

            const infoProyecto = document.createElement('div');
            infoProyecto.className = 'info-proyecto';
            infoProyecto.innerHTML = `<h4>${foto.titulo}</h4><p>GRUPO JIREH</p>`;
            panel.appendChild(infoProyecto);

            // 🌗 3. CREAMOS EL REFLEJO (Hermano 2)
            const reflejo = document.createElement('div');
            reflejo.className = 'reflejo';
            reflejo.style.transformStyle = 'preserve-3d';

            const imgReflejo = document.createElement('img');
            imgReflejo.src = foto.src;
            imgReflejo.loading = 'eager';
            imgReflejo.style.transform = 'scaleY(-1)'; // Volteo óptico vertical
            imgReflejo.style.width = '100%';
            imgReflejo.style.height = '100%';
            imgReflejo.style.objectFit = 'cover';
            reflejo.appendChild(imgReflejo);

            // 🤝 4. ENSAMBLE DE HERMANOS INDEPENDIENTES
            tarjetaWrap.appendChild(panel);
            tarjetaWrap.appendChild(reflejo);

            tarjetaWrap.addEventListener('click', () => abrirModal(foto.src, foto.titulo));
            
            const infoElemento = {
                tarjetaWrap, 
                panel,
                reflejo, 
                indice: i,
                categoria: foto.categoria,
                titulo: foto.titulo,
                escala: 1.0
            };
            
            tarjetaWrap.addEventListener('mouseenter', () => { infoElemento.escala = 1.08; });
            tarjetaWrap.addEventListener('mouseleave', () => { infoElemento.escala = 1.0; });

            if (elementosDOM.contenedorPaneles) elementosDOM.contenedorPaneles.appendChild(tarjetaWrap);

            estado.elementosActivos.push(infoElemento);
        });

        activarControlesInmersivos();
        estado.galeriaCargada = true;

        if (estado.idAnimacionFrame) cancelAnimationFrame(estado.idAnimacionFrame);
        estado.ultimoTiempo = 0;
        estado.idAnimacionFrame = requestAnimationFrame(bucle);
    }

    function bucle(tiempoActual) {
        if (!estado.modoCarrusel) return;

        if (!estado.ultimoTiempo) estado.ultimoTiempo = tiempoActual;
        const deltaTime = (tiempoActual - estado.ultimoTiempo) / 1000;
        estado.ultimoTiempo = tiempoActual;

        if (deltaTime > 0 && deltaTime < 0.1) {
            animar(deltaTime);
        }

        estado.idAnimacionFrame = requestAnimationFrame(bucle);
    }

    function animar(deltaTime) {
    if (!estado.modoCarrusel || estado.usarModo2D || estado.elementosActivos.length === 0) return;

    // ====== ACTUALIZACIÓN GLOBAL DEL CARRUSEL ======
    if (estado.rotacionManual) {
        estado.angulo += estado.deltaMouse * CONFIG.CARRUSEL.VELOCIDAD_ROTACION_MOUSE;
        estado.inercia = estado.deltaMouse * 0.5;
    } else {
        estado.angulo += CONFIG.CARRUSEL.VELOCIDAD_ROTACION * deltaTime;
    }

    // ====== NORMALIZACIÓN DEL ÁNGULO ======
    estado.angulo = (estado.angulo % 360 + 360) % 360;
    const separacionAngular = CONFIG.CARRUSEL.SEPARACION_ANGULAR;

    // ====== ACTUALIZACIÓN DE PANELES Y REFLEJOS ======
    estado.elementosActivos.forEach((obj) => {
        if (!obj || !obj.tarjetaWrap) return;

        // 1. Datos del panel original
        const rotacionLocal = estado.angulo + obj.indice * separacionAngular;
        const radianes = rotacionLocal * Math.PI / 180;

        // 2. Posición base (Calculada una sola vez para ambos)
        const posX_panel = Math.sin(radianes) * estado.radioActual;
        const posZ_panel = Math.cos(radianes) * estado.radioActual;

        // 3. Posición Panel Original
        obj.tarjetaWrap.style.transform = `
            translate3d(${posX_panel.toFixed(1)}px, ${-CONFIG.CARRUSEL.ALTO_PANEL / 2}px, ${posZ_panel.toFixed(1)}px)
            rotateY(${-rotacionLocal.toFixed(2)}deg)
        `;

        // 4. Reflejo Individual (El suelo en forma de "L")
        if (obj.reflejo) {
            // Usamos el radio específico del reflejo para mantener el suelo limpio
            const reflejoX = Math.sin(radianes) * CONFIG.CARRUSEL.RADIO_REFLEJO;
            const reflejoZ = Math.cos(radianes) * CONFIG.CARRUSEL.RADIO_REFLEJO;
            
            obj.reflejo.style.transform = `
                translate3d(${reflejoX.toFixed(1)}px, ${CONFIG.CARRUSEL.DESPLAZAMIENTO_REFLEJO_Y}px, ${reflejoZ.toFixed(1)}px)
                rotateY(${-rotacionLocal.toFixed(2)}deg)
                rotateX(60deg)
            `;
            
            // Mantenemos la opacidad sutil para el realismo
            obj.reflejo.style.opacity = "0.6";
        }
    });
}


    // ==============================================
    // 🕹️ CONTROLES DE INTERACCIÓN PREMIUM
    // ==============================================
    function iniciarArrastre(clientX) {
        estado.rotacionManual = true;
        estado.posicionMouseX = clientX; 
        estado.deltaMouse = 0;
        if (elementosDOM.contenedorEscena) {
            elementosDOM.contenedorEscena.style.cursor = 'grabbing';
        }
    }

    function finalizarArrastre() {
        estado.rotacionManual = false;
        estado.deltaMouse = 0;
        if (elementosDOM.contenedorEscena) {
            elementosDOM.contenedorEscena.style.cursor = 'grab';
        }
    }

    function activarControlesInmersivos() {
        if (!elementosDOM.contenedorEscena || estado.controlesActivados) return;
        estado.controlesActivados = true;

        const contenedor = elementosDOM.contenedorEscena;

        contenedor.addEventListener('mouseenter', () => {
            estado.velocidadActual = CONFIG.CARRUSEL.VELOCIDAD_RAPIDA;
        });
        contenedor.addEventListener('mouseleave', () => {
            estado.velocidadActual = CONFIG.CARRUSEL.VELOCIDAD_ROTACION;
            finalizarArrastre();
        });

        contenedor.addEventListener('mousedown', (e) => {
            e.preventDefault();
            iniciarArrastre(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
            if (estado.rotacionManual) {
                const posicionAnterior = estado.posicionMouseX;
                estado.posicionMouseX = e.clientX;
                
                estado.deltaMouse = estado.posicionMouseX - posicionAnterior;
                estado.deltaMouse = Math.max(-30, Math.min(30, estado.deltaMouse)); 
            }
        });

        window.addEventListener('mouseup', finalizarArrastre);

        contenedor.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                iniciarArrastre(e.touches[0].clientX);
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (estado.rotacionManual && e.touches.length === 1) {
                const posicionAnterior = estado.posicionMouseX;
                estado.posicionMouseX = e.touches[0].clientX;
                
                estado.deltaMouse = estado.posicionMouseX - posicionAnterior;
                estado.deltaMouse = Math.max(-30, Math.min(30, estado.deltaMouse));
            }
        }, { passive: true });

        window.addEventListener('touchend', finalizarArrastre);
        window.addEventListener('touchcancel', transatlantic = finalizarArrastre);

        contenedor.addEventListener('wheel', (e) => {
            e.preventDefault();
            estado.radioActual += e.deltaY * 1.5;
            estado.radioActual = Math.max(
                CONFIG.CARRUSEL.RADIO_MIN,
                Math.min(CONFIG.CARRUSEL.RADIO_MAX, estado.radioActual)
            );
        }, { passive: false });
    }

    function abrirModal(src, titulo = '') {
        if (!elementosDOM.fotoModal || !elementosDOM.imgFull) return;
        
        elementosDOM.imgFull.src = src;
        elementosDOM.imgFull.alt = titulo;
        
        elementosDOM.fotoModal.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.98);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.5s ease;
            padding: 1rem;
        `;
        
        setTimeout(() => {
            elementosDOM.fotoModal.style.opacity = 1;
        }, 50);
        
        document.body.style.overflow = 'hidden';
    }

    if (elementosDOM.fotoModal) {
        elementosDOM.fotoModal.addEventListener('click', () => {
            elementosDOM.fotoModal.style.opacity = 0;
            setTimeout(() => {
                elementosDOM.fotoModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 500);
        });
    }

    function reiniciarCarrusel() {
        estado.modoCarrusel = true;
        estado.angulo = 0;
        estado.radioActual = CONFIG.CARRUSEL.RADIO_BASE;
        estado.ultimoTiempo = 0;
        
        if (estado.idAnimacionFrame) cancelAnimationFrame(estado.idAnimacionFrame);
        
        inicializarEscenario();
    }

    function mostrarCarrusel() {
        estado.modoCarrusel = true;
        if (elementosDOM.contenedorEscena) elementosDOM.contenedorEscena.style.display = 'flex';
        if (elementosDOM.galeriaCuadratica) elementosDOM.galeriaCuadratica.style.display = 'none';
        reiniciarCarrusel();
    }

    document.addEventListener('DOMContentLoaded', () => {
        mostrarCarrusel();
    });

})();
