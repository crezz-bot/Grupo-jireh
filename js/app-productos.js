document.addEventListener('DOMContentLoaded', () => {

    const contenedor = document.getElementById('grid-accesorios');

    const herrajes = galeriaProyectos.filter(p => 
        p.categoria === 'herrajes-grupo-jireh' && p.src !== ''
    );

    herrajes.forEach(h => {
        const card = document.createElement('div');
        card.className = 'accesorio-card';
        
        // 🎨 ESTILOS BASE DE LA TARJETA (ESTADO NORMAL)
        // Aquí definimos que empiece limpia, sin borde visible
        card.style.cssText = `
            position: relative;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 12px;
            overflow: hidden;
            padding: 0;
            margin: 0;
            /* Borde transparente, para que solo se vea al pasar el ratón */
            border: 3px solid transparent; 
            /* Sombra suave normal */
            box-shadow: 0 4px 15px rgba(0, 86, 179, 0.2); 
            transition: all 0.4s ease; /* La transición suave para todo */
            transform: translateY(0);
        `;
        
        const mensajeWA = `Hola Grupo Jireh, me interesa información sobre: ${h.titulo}`;
        const urlWA = `https://wa.me/522226597804?text=${encodeURIComponent(mensajeWA)}`;

        card.innerHTML = `
            <img src="${h.src}" alt="${h.titulo}" style="width:100%; display:block;">
            <div style="padding:15px; text-align:center;">
                <h3 style="color:#004085; font-size:1.1rem; margin:10px 0; font-weight:bold;">${h.titulo}</h3>
                <a href="${urlWA}" target="_blank" 
                   style="
                       background: linear-gradient(135deg, #0056b3, #002c66);
                       color: #ffffff; 
                       padding: 12px 20px; 
                       border-radius: 30px;
                       text-decoration: none; 
                       display: block;
                       font-weight: bold;
                       font-size: 0.95rem;
                       letter-spacing: 0.5px;
                       text-transform: uppercase;
                       border: 1px solid rgba(212, 175, 55, 0.6);
                       box-shadow: 0 4px 12px rgba(0, 86, 179, 0.3), inset 0 1px 2px rgba(255,255,255,0.2);
                       transition: all 0.3s ease;
                   "
                   onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; 
                                this.style.boxShadow='0 8px 20px rgba(0, 86, 179, 0.5), 0 0 15px rgba(212, 175, 55, 0.4)';
                                this.style.background='linear-gradient(135deg, #0069d9, #003a85)';"
                   onmouseout="this.style.transform='translateY(0) scale(1)'; 
                               this.style.boxShadow='0 4px 12px rgba(0, 86, 179, 0.3), inset 0 1px 2px rgba(255,255,255,0.2)';
                               this.style.background='linear-gradient(135deg, #0056b3, #002c66)';">
                    <i class="fab fa-whatsapp" style="margin-right:8px; font-size:1.1rem; text-shadow: 0 0 5px rgba(255,255,255,0.5);"></i>
                    Cotizar ahora
                </a>
            </div>
        `;

        // 👇👇👇 AQUÍ ESTÁ LA MAGIA: EFECTO PARA TODO EL BLOQUE 👇👇👇

        // EVENTO AL PASAR EL RATÓN ENCIMA DEL BLOQUE COMPLETO
        card.onmouseover = function() {
            // 1. Se levanta como ya lo querías
            this.style.transform = 'translateY(-8px)';
            
            // 2. Aparece el BORDE AZUL ALREDEDOR DE TODO EL BLOQUE
            this.style.borderColor = '#0056b3'; 
            
            // 3. Se ilumina todo el contorno con un resplandor azul
            this.style.boxShadow = `
                0 10px 25px rgba(0, 86, 179, 0.4), 
                0 0 20px rgba(0, 86, 179, 0.6), 
                inset 0 0 10px rgba(0, 86, 179, 0.1)
            `;
        };

        // EVENTO AL QUITAR EL RATÓN
        card.onmouseout = function() {
            // 1. Vuelve a su lugar
            this.style.transform = 'translateY(0)';
            
            // 2. El borde desaparece (se vuelve transparente)
            this.style.borderColor = 'transparent';
            
            // 3. La sombra vuelve a ser suave y normal
            this.style.boxShadow = '0 4px 15px rgba(0, 86, 179, 0.2)';
        };

        contenedor.appendChild(card);
    });
});
