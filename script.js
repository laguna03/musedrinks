const videoConfig = {
    sources: [
        { src: '/muse-video.mp4', type: 'video/mp4' },
        { src: '/muse-video.webm', type: 'video/webm' }
    ]
};

const video = document.getElementById('scroll-video');
const loadingOverlay = document.getElementById('loading-overlay');

function loadVideo() {
    video.muted = true;
    video.defaultMuted = true;

    while (video.firstChild) {
        video.removeChild(video.firstChild);
    }

    videoConfig.sources.forEach(source => {
        const sourceEl = document.createElement('source');
        sourceEl.src = source.src;
        sourceEl.type = source.type;
        video.appendChild(sourceEl);
    });

    video.load();

    video.addEventListener('loadeddata', () => {
        loadingOverlay.classList.add('hidden');
        initScrollEngine();
    }, { once: true });

    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        initScrollEngine();
    }, 6000);
}

function initScrollEngine() {
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                updateVideo();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    updateVideo();
}

function updateVideo() {
    const scrollTop = window.scrollY;
    const track = document.getElementById('scroll-track');
    const trackHeight = track.offsetHeight;
    const maxScroll = trackHeight - window.innerHeight;

    let percentage = maxScroll > 0 ? scrollTop / maxScroll : 0;
    percentage = Math.min(1, Math.max(0, percentage));

    if (video.duration && video.duration > 0) {
        const targetTime = percentage * video.duration;
        if (Math.abs(video.currentTime - targetTime) > 0.05) {
            video.currentTime = targetTime;
        }
    }
}

loadVideo();
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