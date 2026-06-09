/**
 * ============================================================================
 * GALERÍA 3D INTEGRAL - GRUPO JIREH 2026
 * 🚀 VERSIÓN ULTRA-INMERSIVA: EFECTO PANTALLA CURVA / CABINA DE CINE
 * 🧠 CON DETECTOR DE HARDWARE INTELIGENTE (FILTRO MÓVIL ANTIGUO / 2D RETROALIMENTADO)
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
            DESPLAZAMIENTO_REFLEJO_Y: 220, 
            RADIO_REFLEJO: 1450, 
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
        COLUMNAS: 4,          // 💻 Computadoras (4 fotos por fila)
        COLUMNAS_TABLET: 3,   // 📐 Tablets o pantallas medianas (3 por fila)
        COLUMNAS_MOVIL: 2     // 📱 Celulares (2 fotos por fila - ¡Adiós scroll infinito!)
    }

    };

    const elementosDOM = {
        contenedorPaneles: validarElemento('vr-carrusel-paneles'),
        contenedorReflejos: validarElemento('vr-carrusel-reflejos'),
        escenaShowroom: validarElemento('escena-showroom'),
        galeriaCuadratica: validarElemento('galeria-cuadratica'),
        contenedorGrid: validarElemento('contenedor-grid'),
        fotoModal: validarElemento('fotoModal'),
        imgFull: validarElemento('imgFull'),
        btnVolver: validarElemento('btn-volver-carrusel'),
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
        idAnimacionFrame: null,
        usarModo2D: false // 👈 Bandera de control para abortar animaciones pesadas si es necesario
    };

    function validarElemento(id) {
        const elemento = document.getElementById(id);
        if (!elemento) console.warn(`⚠️ Elemento con ID "${id}" no encontrado`);
        return elemento;
    }

    // ==============================================
    // 🧠 DETECCIÓN DE DISPOSITIVO Y RECURSOS
    // ==============================================
    function verificarCapacidadDispositivo() {
        console.log("%c=== ANÁLISIS DE COMPATIBILIDAD GRUPO JIREH ===", "color: #0099ff; font-weight: bold");
        
        // 1. DETECCIÓN DE SOPORTE GRÁFICO HARDWARE
        const soportaWebGL = (() => {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                return !!gl && gl.getParameter(gl.RENDERER) !== null;
            } catch (e) {
                return false;
            }
        })();

        // 2. DETECCIÓN DE INFRAESTRUCTURA CSS 3D
        const soportaCSS3D = window.CSS && CSS.supports && CSS.supports('transform-style', 'preserve-3d');

        // 3. DETECCIÓN DE NAVEGADOR MUY ANTIGUO (Filtro Regex Limpio)
        const esNavegadorAntiguo = (() => {
            const userAgent = navigator.userAgent;
            return /MSIE|Trident|Android 4|iOS 8|Safari 9|Chrome < 60|Firefox < 55/i.test(userAgent);
        })();

        // 4. CONTROL DE MEMORIA RAM (Con salvaguarda para iPhones/iPads que tiran undefined)
        const ramDetectada = navigator.deviceMemory || 4; 

        // 5. EVALUACIÓN TOTAL CRÍTICA
        const forzarModo2D = !soportaWebGL || !soportaCSS3D || esNavegadorAntiguo || ramDetectada < 2;

        return {
            usarModo2D: forzarModo2D,
            detalles: {
                webgl: soportaWebGL,
                css3d: soportaCSS3D,
                antiguo: esNavegadorAntiguo,
                ramEstimada: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "No declarada (Protegida/iOS)"
            }
        };
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

        let estiloClases = document.getElementById('estilos-galeria-3D-jireh');
        if (!estiloClases) {
            estiloClases = document.createElement('style');
            estiloClases.id = 'estilos-galeria-3D-jireh';
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

            .tarjeta-3d-wrap {
                position: absolute;
                width: ${CONFIG.CARRUSEL.ANCHO_PANEL}px;
                height: ${CONFIG.CARRUSEL.ALTO_PANEL}px;
                transform-style: preserve-3d !important;
                overflow: visible !important; 
                perspective: 1000px;
                will-change: transform, opacity; /* ⚡ Aceleración de hardware */
            }

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
                transform-origin: center bottom !important; 
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

            .info-proyecto {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                padding: 0.5rem;
                background: linear-gradient(to top, rgba(5, 10, 20, 0.95) 40%, transparent 100%);
                transform: translateZ(25px) !important;
                border-radius: 0 0 1rem 1rem;
                z-index: 100;
                pointer-events: none;
                text-align: center;
            }
            .info-proyecto h4 {
                font-size: 0.85rem !important;
                margin: 0 0 0.1rem 0 !important;
                font-weight: 700;
                letter-spacing: 0.5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: #00f3ff !important;
                text-shadow: 0 0 4px rgba(0, 243, 255, 0.6), 0 0 10px rgba(0, 243, 255, 0.4);
            }
            .info-proyecto p {
                font-size: 0.65rem !important;
                margin: 0 !important;
                font-weight: 600;
                letter-spacing: 1.5px;
                color: #e0faff !important;
                text-shadow: 0 0 3px rgba(0, 217, 255, 0.5);
            }

            .reflejo {
                position: absolute;
                top: 100%;   
                left: 0;
                width: 100%;
                height: 90%; 
                pointer-events: none !important;
                overflow: visible !important;
                z-index: 20;
                transform-origin: center top !important; 
                transform-style: preserve-3d !important;
               background: linear-gradient(to top, rgba(10, 15, 30, 0.85) 0%, rgba(0, 217, 255, 0.08) 25%, rgba(0, 0, 0, 0.98) 100%);
    border-top: 1.5px solid rgba(0, 217, 255, 0.4); 
    
    /* 🔄 NUEVO DIFUMINADO INVERTIDO: De abajo hacia arriba */
    -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 20%, rgba(0, 0, 0, 1) 100%);
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 40%, rgba(0, 0, 0, 1) 100%);
}
            .reflejo img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 0 0 1rem 1rem;
                display: block;
                transform: scaleY(-1);
                opacity: 0.8 !important; 
                filter: none;
            }
            .reflejo .info-proyecto { display: none !important; }

            /* ==============================================
             * 📱 ESTILOS ADAPTATIVOS PARA EL MODO PLANO 2D
             * ============================================== */
            .modo-2d-limpio {
                perspective: none !important;
                transform-style: flat !important;
                height: auto !important;
                cursor: default !important;
            }
            .modo-2d-limpio #escena-showroom-3d {
                display: block !important;
                height: auto !important;
            }
            .modo-2d-limpio #vr-carrusel-reflejos,
            .modo-2d-limpio .reflejo {
                display: none !important; /* 🔥 Apagamos los reflejos para salvar la GPU */
            }
            .modo-2d-limpio #vr-carrusel-paneles {
                position: relative !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: auto !important;
                display: grid !important;
                grid-template-columns: repeat(4, 1fr) !important; /* Cuadrícula limpia */
                gap: 20px !important;
                padding: 30px !important;
                transform: none !important;
            }
            .modo-2d-limpio .tarjeta-3d-wrap {
                position: relative !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 280px !important; /* Altura cómoda para lista */
                transform: none !important;
                opacity: 1 !important;
                filter: none !important;
            }
            .modo-2d-limpio .panel {
                position: relative !important;
                height: 100% !important;
                transform: none !important;
                box-shadow: 0 4px 15px rgba(0, 217, 255, 0.25) !important;
            }

            @media (max-width: 992px) {
                .modo-2d-limpio #vr-carrusel-paneles { grid-template-columns: repeat(3, 1fr) !important; }
            }
            @media (max-width: 768px) {
                #contenedor-grid-limpio { grid-template-columns: repeat(${CONFIG.GRID.COLUMNAS_MOVIL}, 1fr); }
                .tarjeta-3d-wrap { width: 150px; height: 180px; }
                .reflejo { width: 100%; height: ${180 * 0.6}px; }
                /* Grid 2D en móviles antiguos o pantallas chicas */
                .modo-2d-limpio #vr-carrusel-paneles { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; padding: 15px !important; }
                .modo-2d-limpio .tarjeta-3d-wrap { height: 220px !important; }
            }
        `;
    }

    // ==============================================
    // ⚙️ INICIALIZADORES DIFERENCIADOS (3D vs 2D)
    // ==============================================
    function inicializarCarrusel3D() {
        console.log("%c=== INFRAESTRUCTURA IMAX 3D INICIADA ===", "color: #2ecc71; font-weight: bold");
        
        inicializarProfundidad(); 
        aplicarEstilosInmersivos();

        const fotosMezcladas = mezclarArray([...galeriaProyectos]);
        const fotosSeleccionadas = fotosMezcladas.slice(0, CONFIG.CARRUSEL.TOTAL_ELEMENTOS);

        if (elementosDOM.contenedorPaneles) elementosDOM.contenedorPaneles.innerHTML = '';
        if (elementosDOM.contenedorReflejos) elementosDOM.contenedorReflejos.innerHTML = '';
        
        estado.elementosActivos = [];

        fotosSeleccionadas.forEach((foto, i) => {
            const tarjetaWrap = document.createElement('div');
            tarjetaWrap.className = 'tarjeta-3d-wrap';
            tarjetaWrap.dataset.indice = i;
            tarjetaWrap.style.cssText = `
                position: absolute;
                transform-style: preserve-3d;
                width: ${CONFIG.CARRUSEL.ANCHO_PANEL}px;
                height: ${CONFIG.CARRUSEL.ALTO_PANEL}px;
            `;

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

            const reflejo = document.createElement('div');
            reflejo.className = 'reflejo';
            reflejo.style.transformStyle = 'preserve-3d';

            const imgReflejo = document.createElement('img');
            imgReflejo.src = foto.src;
            imgReflejo.loading = 'eager';
            imgReflejo.style.transform = 'scaleY(-1)'; 
            imgReflejo.style.width = '100%';
            imgReflejo.style.height = '100%';
            imgReflejo.style.objectFit = 'cover';
            reflejo.appendChild(imgReflejo);

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

    function inicializarCarrusel2D() {
        console.log("%c=== INFRAESTRUCTURA GRID 2D SEGURA INICIADA ===", "color: #ff9800; font-weight: bold");
        
        aplicarEstilosInmersivos(); // Genera las etiquetas base del DOM de forma segura

        // Forzamos al contenedor maestro a romper la matriz de profundidad
        if (elementosDOM.contenedorEscena) elementosDOM.contenedorEscena.classList.add('modo-2d-limpio');
        if (elementosDOM.contenedorPaneles) elementosDOM.contenedorPaneles.innerHTML = '';
        
        // Cargamos todas las fotos estructuradas directamente sobre un plano CSS Grid elegante
        const fotosParaGrid = [...galeriaProyectos];

        fotosParaGrid.forEach((foto, i) => {
            const tarjetaWrap = document.createElement('div');
            tarjetaWrap.className = 'tarjeta-3d-wrap';

            const panel = document.createElement('div');
            panel.className = 'panel';

            const img = document.createElement('img');
            img.src = foto.src;
            img.alt = foto.titulo;
            img.loading = 'lazy'; // Eficiente en consumo de datos móviles 📱
            panel.appendChild(img);

            const infoProyecto = document.createElement('div');
            infoProyecto.className = 'info-proyecto';
            infoProyecto.innerHTML = `<h4>${foto.titulo}</h4><p>GRUPO JIREH</p>`;
            panel.appendChild(infoProyecto);

            tarjetaWrap.appendChild(panel);
            tarjetaWrap.addEventListener('click', () => abrirModal(foto.src, foto.titulo));

            if (elementosDOM.contenedorPaneles) elementosDOM.contenedorPaneles.appendChild(tarjetaWrap);
        });

        estado.galeriaCargada = true;
    }

    // ==============================================
    // 🔄 HILO PRINCIPAL DE RENDERIZADO (3D EXCLUSIVO)
    // ==============================================
    function bucle(tiempoActual) {
        if (!estado.modoCarrusel || estado.usarModo2D) return; // 🛑 Freno de mano si muta a 2D

        if (!estado.ultimoTiempo) estado.ultimoTiempo = tiempoActual;
        const deltaTime = (tiempoActual - estado.ultimoTiempo) / 1000;
        estado.ultimoTiempo = tiempoActual;

        if (deltaTime > 0 && deltaTime < 0.1) {
            animar(deltaTime);
        }

        estado.idAnimacionFrame = requestAnimationFrame(bucle);
    }
  

           function animar(deltaTime) {
        if (!estado.modoCarrusel || estado.elementosActivos.length === 0) return;

        if (estado.rotacionManual) {
            estado.angulo += estado.deltaMouse * CONFIG.CARRUSEL.VELOCIDAD_ROTACION_MOUSE;
            estado.inercia = estado.deltaMouse * 0.5;
            estado.deltaMouse = 0; 
        } else {
            estado.angulo += estado.velocidadActual * deltaTime + estado.inercia * deltaTime;
            estado.inercia *= Math.exp(-4 * deltaTime); 
        }
        
        estado.angulo = (estado.angulo % 360 + 360) % 360;
        const separacionAngularActual = 360 / estado.elementosActivos.length;

        const medioAncho = CONFIG.CARRUSEL.ANCHO_PANEL / 2;
        const medioAlto = CONFIG.CARRUSEL.ALTO_PANEL / 2;

        estado.elementosActivos.forEach((obj) => {
            if (!obj || !obj.tarjetaWrap) return;

            const rotacionLocal = estado.angulo + obj.indice * separacionAngularActual;
            const radianes = (rotacionLocal * Math.PI) / 180;
            
            const posicionX = -Math.sin(radianes) * estado.radioActual;
            const posicionZ = -Math.cos(radianes) * estado.radioActual;
            const efectos = calcularEfectos3D(rotacionLocal);

            // 👑 CORRECCIÓN OPTICA DE PROFUNDIDAD REAL (Efecto domo envolvente):
            const escalaProfundidadReal = (1 + (posicionZ / estado.radioActual) * 0.2) * obj.escala;
            const inclinacionXPanel = posicionZ * 0.02; 

            // 🔹 UBICACIÓN GLOBAL CON DEGRADADO DE PERSPECTIVA
            obj.tarjetaWrap.style.transform = `
                translate3d(${(posicionX - medioAncho).toFixed(1)}px, ${-medioAlto}px, ${posicionZ.toFixed(1)}px)
                rotateY(${-rotacionLocal.toFixed(2)}deg)
                rotateX(${inclinacionXPanel.toFixed(2)}deg)
                scale(${escalaProfundidadReal.toFixed(3)})
            `;
                     
            obj.tarjetaWrap.style.filter = `brightness(${efectos.brillo.toFixed(2)}) contrast(1.05)`;
            obj.tarjetaWrap.style.opacity = efectos.opacidad.toFixed(2);
            obj.tarjetaWrap.style.zIndex = Math.floor((posicionZ + estado.radioActual) * 10);

            if (obj.panel) {
                obj.panel.style.transform = `translate3d(0px, 0px, 0px) rotateX(0deg)`;
            }

            if (obj.reflejo) {
                obj.reflejo.style.transform = `
                    translate3d(0px, 0px, 0.5px) 
                    rotateX(75deg)
                `;
                const brilloFuerte = Math.max(0.55, efectos.brillo * 1.1);
                obj.reflejo.style.filter = `blur(0.6px) brightness(${brilloFuerte})`;
                obj.reflejo.style.opacity = "0.8";
            }
        }); 
    }


    // ==============================================
    // 🕹️ CONTROLES DE INTERACCIÓN PREMIUM
    // ==============================================
    function iniciarArrastre(clientX) {
        if (estado.usarModo2D) return; // Deshabilitar arrastre físico si está aplanado
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
        if (elementosDOM.contenedorEscena && !estado.usarModo2D) {
            elementosDOM.contenedorEscena.style.cursor = 'grab';
        }
    }

    function activarControlesInmersivos() {
        if (!elementosDOM.contenedorEscena || estado.controlesActivados) return;
        estado.controlesActivados = true;

        const contenedor = elementosDOM.contenedorEscena;

        contenedor.addEventListener('mouseenter', () => {
            if (!estado.usarModo2D) estado.velocidadActual = CONFIG.CARRUSEL.VELOCIDAD_RAPIDA;
        });
        contenedor.addEventListener('mouseleave', () => {
            if (!estado.usarModo2D) estado.velocidadActual = CONFIG.CARRUSEL.VELOCIDAD_ROTACION;
            finalizarArrastre();
        });

        contenedor.addEventListener('mousedown', (e) => {
            if (estado.usarModo2D) return;
            e.preventDefault();
            iniciarArrastre(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
            if (estado.rotacionManual && !estado.usarModo2D) {
                const posicionAnterior = estado.posicionMouseX;
                estado.posicionMouseX = e.clientX;
                estado.deltaMouse = estado.posicionMouseX - posicionAnterior;
                estado.deltaMouse = Math.max(-30, Math.min(30, estado.deltaMouse)); 
            }
        });

        window.addEventListener('mouseup', finalizarArrastre);

        contenedor.addEventListener('touchstart', (e) => {
            if (estado.usarModo2D) return;
            if (e.touches.length === 1) {
                iniciarArrastre(e.touches[0].clientX);
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (estado.rotacionManual && e.touches.length === 1 && !estado.usarModo2D) {
                const posicionAnterior = estado.posicionMouseX;
                estado.posicionMouseX = e.touches[0].clientX;
                estado.deltaMouse = estado.posicionMouseX - posicionAnterior;
                estado.deltaMouse = Math.max(-30, Math.min(30, estado.deltaMouse));
            }
        }, { passive: true });

              window.addEventListener('touchend', finalizarArrastre);
        window.addEventListener('touchcancel', finalizarArrastre);

        contenedor.addEventListener('wheel', (e) => {
            if (estado.usarModo2D) return; // Bloquear zoom tridimensional en modo plano
            e.preventDefault();
            estado.radioActual += e.deltaY * 1.5;
            estado.radioActual = Math.max(
                CONFIG.CARRUSEL.RADIO_MIN,
                Math.min(CONFIG.CARRUSEL.RADIO_MAX, estado.radioActual)
            );
        }, { passive: false });
    } // 👈 AQUÍ SE CIERRA CORRECTAMENTE 'activarControlesInmersivos'
       
  // ==============================================
// 🗂️ SECCIÓN DE CATEGORÍAS - VERSIÓN EXACTA A TU HTML
// ==============================================
document.querySelectorAll('.btn-filtro-2026').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const categoriaSeleccionada = e.currentTarget.dataset.categoria;

        // PASO 1: OCULTAMOS CARRUSEL 3D
        if (elementosDOM.escenaShowroom) {
            elementosDOM.escenaShowroom.style.opacity = "0";
            elementosDOM.escenaShowroom.style.transition = `opacity ${CONFIG.VISUAL.TRANSICION_ESCENA}ms ease`;
        }
        
        setTimeout(() => {
            estado.modoCarrusel = false;

            // Ocultamos todo el bloque 3D
            if (elementosDOM.contenedorEscena) {
                elementosDOM.contenedorEscena.style.display = "none";
            }

            // 🔑 PASO CLAVE: ACTIVAMOS TU GRID
            if (elementosDOM.galeriaCuadratica) {
                // ✅ LE QUITAMOS LA CLASE QUE LO OCULTA (¡ESTO ERA LO QUE FALTABA!)
                elementosDOM.galeriaCuadratica.classList.remove("seccion-grid-oculta");
                elementosDOM.galeriaCuadratica.style.display = "block";
                elementosDOM.galeriaCuadratica.style.opacity = "0";
                elementosDOM.galeriaCuadratica.style.width = "100%";
                elementosDOM.galeriaCuadratica.style.padding = "2rem";
                elementosDOM.galeriaCuadratica.style.background = "#0a0a1a"; // Fondo seguro
                elementosDOM.galeriaCuadratica.style.minHeight = "100vh"; // Que cubra todo
                elementosDOM.galeriaCuadratica.style.transition = `opacity ${CONFIG.VISUAL.TRANSICION_ESCENA}ms ease`;
            }

            // 🎯 VALIDACIÓN DE DATOS
            if (typeof galeriaProyectos === "undefined") {
                console.error("❌ Falta datos-galeria.js");
                return;
            }

            // 🎯 FILTRADO
            const fotosFiltradas = (categoriaSeleccionada === "todos")
                ? galeriaProyectos
                : galeriaProyectos.filter(foto => {
                    return foto.categoria && foto.categoria.toLowerCase().trim() === categoriaSeleccionada.toLowerCase().trim();
                });

            // 🎯 CONFIGURAMOS TU CONTENEDOR: id="contenedor-grid" class="grid-proyectos-2026"
            if (elementosDOM.contenedorGrid) {
                elementosDOM.contenedorGrid.innerHTML = ""; // Limpiamos

                // Responsivo automático
                const ancho = window.innerWidth;
                let columnas;
                if (ancho < 480) columnas = CONFIG.GRID.COLUMNAS_MOVIL;
                else if (ancho < 768) columnas = CONFIG.GRID.COLUMNAS_TABLET;
                else columnas = CONFIG.GRID.COLUMNAS;

                elementosDOM.contenedorGrid.style.cssText = `
                    display: grid !important;
                    grid-template-columns: repeat(${columnas}, 1fr);
                    gap: 1.5rem;
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                `;
            }

            // 🎯 CREAMOS LAS TARJETAS
            fotosFiltradas.forEach((foto, i) => {
                const tarjeta = document.createElement("div");
                tarjeta.className = "item-grid";
                tarjeta.style.cssText = `
                    width: 100%;
                    height: 250px;
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 0 15px rgba(0,217,255,0.1);
                    transform: translateY(20px);
                    opacity: 0;
                    transition: all 0.5s ease;
                    cursor: pointer;
                    position: relative;
                    background: #101025;
                `;

                tarjeta.innerHTML = `
                    <img 
                        src="${foto.src}" 
                        alt="${foto.titulo}" 
                        loading="lazy"
                        style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;"
                    >
                    <div style="
                        position: absolute;
                        bottom: 0;
                        width: 100%;
                        padding: 0.5rem;
                        background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                        color: white;
                        font-size: 0.9rem;
                    ">
                        ${foto.titulo}
                    </div>
                `;

                // Efectos hover
                tarjeta.addEventListener("mouseenter", () => {
                    const img = tarjeta.querySelector("img");
                    if (img) img.style.transform = "scale(1.05)";
                });
                tarjeta.addEventListener("mouseleave", () => {
                    const img = tarjeta.querySelector("img");
                    if (img) img.style.transform = "scale(1)";
                });

                // Abrir modal
                tarjeta.addEventListener("click", () => abrirModal(foto.src, foto.titulo));

                // Insertamos en tu contenedor
                if (elementosDOM.contenedorGrid) {
                    elementosDOM.contenedorGrid.appendChild(tarjeta);
                }

                // Animación escalonada
                setTimeout(() => {
                    tarjeta.style.transform = "translateY(0)";
                    tarjeta.style.opacity = "1";
                }, 50 + (i * 40));
            });

            // ✅ APARECEMOS EL GRID (FIN DEL FONDO NEGRO)
            setTimeout(() => {
                if (elementosDOM.galeriaCuadratica) {
                    elementosDOM.galeriaCuadratica.style.opacity = "1";
                }
            }, 20);

        }, CONFIG.VISUAL.TRANSICION_ESCENA);
    });
});

// ==============================================
// ✅ BOTONES DE VOLVER AL CARRUSEL (ADAPTADO)
// ==============================================
['btn-regresar-carrusel', 'btn-volver-carrusel'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener("click", () => {
            // Ocultamos grid
            if (elementosDOM.galeriaCuadratica) {
                elementosDOM.galeriaCuadratica.style.opacity = "0";
                // 🔑 VOLVEMOS A PONER LA CLASE DE OCULTO
                elementosDOM.galeriaCuadratica.classList.add("seccion-grid-oculta");
            }

            setTimeout(() => {
                if (elementosDOM.galeriaCuadratica) elementosDOM.galeriaCuadratica.style.display = "none";

                // Mostramos escena 3D
                if (elementosDOM.contenedorEscena) {
                    elementosDOM.contenedorEscena.style.display = "block";
                    elementosDOM.escenaShowroom.style.opacity = "0";
                }

                estado.modoCarrusel = true;

                setTimeout(() => {
                    if (elementosDOM.escenaShowroom) elementosDOM.escenaShowroom.style.opacity = "1";
                    // Reiniciamos animación si estaba parada
                    if (!estado.idAnimacionFrame) estado.idAnimacionFrame = requestAnimationFrame(bucle);
                }, 10);

            }, CONFIG.VISUAL.TRANSICION_ESCENA);
        });
    }
});


// 👇 AQUÍ CONTINÚAN TUS SIGUIENTES FUNCIONES DEL CARRUSEL SIN NINGÚN CIERRE EXTRAÑO...

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
        
        setTimeout(() => { elementosDOM.fotoModal.style.opacity = 1; }, 50);
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

       // ==============================================
    // ⚙️ DESPACHADOR INTELIGENTE CON BLINDAJE ANTINULL
    // ==============================================
    function despacharEscenario() {
        // Si 'galeriaProyectos' no existe o está vacía, abortamos limpiamente
        if (typeof galeriaProyectos === 'undefined' || !galeriaProyectos.length) {
            console.warn("⚠️ La variable global 'galeriaProyectos' no está definida o está vacía.");
            return;
        }

        // 🧠 CORREMOS EL ANALIZADOR DE HARDWARE
        const diagnostico = verificarCapacidadDispositivo();
        estado.usarModo2D = diagnostico.usarModo2D;

        // 🛡️ BLINDAJE COMPLETO: Si los contenedores esenciales no existen en tu HTML,
        // evitamos que el código truene con un TypeError.
        if (!elementosDOM.contenedorPaneles) {
            console.error("❌ Error Crítico: No se encontró el elemento 'vr-carrusel-paneles' en el HTML. Deteniendo inicialización.");
            return;
        }

        if (estado.usarModo2D) {
            console.log("%c⚠️ MODO AUTOMÁTICO 2D: Rendimiento optimizado para este móvil.", "color: #ff9800", diagnostico.detalles);
            inicializarCarrusel2D();
        } else {
            console.log("%c🚀 MODO CRISTAL VR 3D: Dispositivo apto para renderizado avanzado.", "color: #2ecc71", diagnostico.detalles);
            inicializarCarrusel3D();
        }
    }

    // ==============================================
    // 🚀 CONTROL DE ARRANQUE SEGURO
    // ==============================================
    document.addEventListener('DOMContentLoaded', () => {
        // Aplicamos estilos condicionales solo a los elementos que SÍ existan en el HTML actual
        if (elementosDOM.contenedorEscena) {
            elementosDOM.contenedorEscena.style.display = 'flex';
        }
        if (elementosDOM.galeriaCuadratica) {
            elementosDOM.galeriaCuadratica.style.display = 'none';
        }
        
        // Arrancamos el flujo unificado
        despacharEscenario();
    });

})();
