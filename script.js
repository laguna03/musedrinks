// ===== CONFIGURACIÓN DEL VIDEO =====
const videoConfig = {
    sources: [
        { src: 'muse-video.mp4', type: 'video/mp4' },
        { src: 'muse-video.webm', type: 'video/webm' }
    ]
};

// ===== CLIP DE TIEMPO PARA SCRUB (segundos) =====
const CLIP_START = 0;    // Inicio del clip
const CLIP_END   = 10;   // Fin del clip (ajusta según la duración de tu video)

// ===== ELEMENTOS DOM =====
const video = document.getElementById('scroll-video');
const loadingOverlay = document.getElementById('loading-overlay');

// ===== VARIABLES DE ESTADO =====
let targetTime = 0;
let isSeeking = false;
let seekTimeout = null;
let lastFrameTime = 0;

// ===== CARGA DEL VIDEO =====
function loadVideo() {
    video.muted = true;
    video.defaultMuted = true;

    // Limpiar fuentes previas
    while (video.firstChild) {
        video.removeChild(video.firstChild);
    }

    // Agregar todas las fuentes
    videoConfig.sources.forEach(source => {
        const sourceEl = document.createElement('source');
        sourceEl.src = source.src;
        sourceEl.type = source.type;
        video.appendChild(sourceEl);
    });

    video.load();

    // Esperar a que el video esté listo
    video.addEventListener('loadeddata', () => {
        loadingOverlay.classList.add('hidden');
        // Forzar render en iOS Safari (play + pause)
        video.play().then(() => {
            video.pause();
            video.currentTime = 0;
        }).catch(() => {});
        initScrollEngine();
    }, { once: true });

    // Safety timeout (si el video tarda demasiado)
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        initScrollEngine();
    }, 6000);
}

// ===== INICIALIZAR EL MOTOR DE SCROLL =====
function initScrollEngine() {
    // Calcular el progreso inicial
    updateTarget();

    // Listeners de eventos
    window.addEventListener('scroll', () => {
        updateTarget();
    }, { passive: true });

    window.addEventListener('resize', () => {
        updateTarget();
    }, { passive: true });

    // Manejar eventos de seeking del video
    video.addEventListener('seeking', () => {
        isSeeking = true;
        // Limpiar timeout previo si existe
        if (seekTimeout) {
            clearTimeout(seekTimeout);
            seekTimeout = null;
        }
    });

    video.addEventListener('seeked', () => {
        isSeeking = false;
        if (seekTimeout) {
            clearTimeout(seekTimeout);
            seekTimeout = null;
        }
    });

    // Iniciar el bucle de animación
    requestAnimationFrame(animateVideo);
}

// ===== ACTUALIZAR EL TIEMPO OBJETIVO BASADO EN EL SCROLL =====
function updateTarget() {
    const scrollTop = window.scrollY;
    const track = document.getElementById('scroll-track');
    const trackHeight = track.offsetHeight;
    const maxScroll = trackHeight - window.innerHeight;

    let progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    progress = Math.min(1, Math.max(0, progress));

    // Mapear al clip de tiempo
    targetTime = CLIP_START + progress * (CLIP_END - CLIP_START);
}

// ===== BUCLE DE ANIMACIÓN CON LERP SUAVIZADO =====
function animateVideo(timestamp) {
    // Calcular delta (tiempo entre frames) en segundos
    let delta = 0;
    if (lastFrameTime > 0) {
        delta = (timestamp - lastFrameTime) / 1000;
    }
    lastFrameTime = timestamp;

    // Limitar delta para evitar saltos bruscos
    delta = Math.min(delta, 0.1);

    // Solo intentar buscar si el video tiene duración válida
    if (video.duration && video.duration > 0) {
        const current = video.currentTime;
        const diff = targetTime - current;

        // Solo hacer algo si la diferencia es significativa
        if (Math.abs(diff) > 0.008) {
            // Si no está buscando, aplicar lerp
            if (!isSeeking) {
                // Factor de suavizado: 14 por segundo (ajustable)
                const lerpFactor = Math.min(1, delta * 14);
                const newTime = current + diff * lerpFactor;

                // Aplicar el tiempo calculado
                video.currentTime = newTime;

                // Si la diferencia aún es grande, activar seeking
                if (Math.abs(targetTime - newTime) > 0.05) {
                    isSeeking = true;
                    if (seekTimeout) {
                        clearTimeout(seekTimeout);
                    }
                    // Safety timeout para evitar estados stuck
                    seekTimeout = setTimeout(() => {
                        isSeeking = false;
                        seekTimeout = null;
                    }, 400);
                }
            } else {
                // Si está buscando, esperar a que termine (seeked)
                // No hacemos nada, el evento seeked se encarga
            }
        }
    }

    // Continuar el bucle
    requestAnimationFrame(animateVideo);
}

// ===== INICIAR LA EXPERIENCIA =====
loadVideo();

// ===== INICIALIZAR FORMULARIO DE PEDIDO =====
initOrderForm();

const WHATSAPP_NUMBER = '7872534967';

function initOrderForm() {
    const flavorBtns = document.querySelectorAll('.select-flavor-btn');
    const display = document.getElementById('selected-flavor-display');
    const orderForm = document.getElementById('order-form');
    const nameInput = document.getElementById('customer-name');
    let selectedFlavor = null;

    flavorBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            flavorBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedFlavor = this.dataset.flavor;
            if (display) {
                display.textContent = `Has seleccionado: ${selectedFlavor}`;
            }
        });
    });

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!selectedFlavor) {
            alert('Por favor selecciona un sabor primero.');
            return;
        }

        const name = nameInput.value.trim();
        const greeting = name ? `Hola, soy ${name}.` : 'Hola,';
        const message = `${greeting} Quiero pedir un jugo de ${selectedFlavor}.`;
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
    });
}

// ===== CARGA INTELIGENTE DE IMÁGENES (prueba PNG y JPG) =====
document.addEventListener('DOMContentLoaded', function() {
    const imageFiles = [
        { id: 'logo-img', name: 'logo' },
        { id: 'img-remolacha', name: 'remolacha' },
        { id: 'img-pepino', name: 'pepino' },
        { id: 'img-zanahoria', name: 'zanahoria' }
    ];

    const extensions = ['png', 'jpg', 'jpeg'];

    imageFiles.forEach(({ id, name }) => {
        const img = document.getElementById(id);
        if (!img) return;

        let currentExtIndex = 0;

        function tryNextExtension() {
            if (currentExtIndex >= extensions.length) {
                img.alt = name + ' (no disponible)';
                img.style.opacity = '0.3';
                return;
            }

            const ext = extensions[currentExtIndex];
            const src = name + '.' + ext;
            img.src = src;

            if (img.complete && img.naturalWidth > 0) {
                img.onerror = null;
                return;
            }

            img.onerror = function() {
                currentExtIndex++;
                tryNextExtension();
            };
        }

        tryNextExtension();
    });
});