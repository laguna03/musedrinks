const videoConfig = {
    sources: [
        { src: 'muse-video.mp4', type: 'video/mp4' },
        { src: 'muse-video.webm', type: 'video/webm' }
    ]
};

// Scroll should scrub the entire video, start to finish
const VIDEO_START_TIME = 0;

const video = document.getElementById('scroll-video');
const sections = document.querySelectorAll('.section-card');
const loadingOverlay = document.getElementById('loading-overlay');

function loadVideo() {
    // iOS Safari requires muted to be set as a JS property, not just an attribute, to allow loading without a user gesture
    video.muted = true;
    video.defaultMuted = true;

    // Clear any existing source elements (just in case)
    while (video.firstChild) {
        video.removeChild(video.firstChild);
    }

    // Add all sources from config
    videoConfig.sources.forEach(source => {
        const sourceEl = document.createElement('source');
        sourceEl.src = source.src;
        sourceEl.type = source.type;
        video.appendChild(sourceEl);
    });

    // Some browsers need an explicit load() after appending the source
    video.load();

    // Start the engine as soon as the first frame is available, not after a full download
    video.addEventListener('loadeddata', () => {
        loadingOverlay.classList.add('hidden');
        initScrollEngine();
    }, { once: true });

    // Safety net: if the video fails to fire loadeddata (e.g. missing file), don't block the page forever
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
                updateVideoAndText();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    // Run immediately so first text appears on page load
    updateVideoAndText();
}

function updateVideoAndText() {
    const scrollTop = window.scrollY;
    // Use the full page height so the video keeps scrubbing all the way to the footer,
    // instead of freezing once the pinned #scroll-track section ends.
    const trackHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Calculate progress from 0 to 1
    let percentage = trackHeight > 0 ? scrollTop / trackHeight : 0;
    percentage = Math.min(1, Math.max(0, percentage));

    // 1. Scrub the video across its full duration
    const maxTime = video.duration && video.duration > 0 ? video.duration : VIDEO_START_TIME;
    const currentVideoTime = VIDEO_START_TIME + percentage * (maxTime - VIDEO_START_TIME);
    // Skip tiny seeks - they just add stutter without any visible frame change
    if (video.duration && video.duration > 0 && Math.abs(video.currentTime - currentVideoTime) > 0.05) {
        video.currentTime = currentVideoTime;
    }

    // 2. Fade in/out placeholder sections (data-start/data-end are video seconds)
    sections.forEach(section => {
        const start = parseFloat(section.dataset.start);
        const end = parseFloat(section.dataset.end);

        if (currentVideoTime >= start && currentVideoTime < end) {
            section.classList.add('visible');
        } else {
            section.classList.remove('visible');
        }
    });
}

// Start the experience
loadVideo();
initOrderForm();

// TODO: replace with the real business WhatsApp number (country code + number, no symbols)
const WHATSAPP_NUMBER = '10000000000';

function initOrderForm() {
    const flavorButtons = document.querySelectorAll('.flavor-option');
    const orderForm = document.getElementById('order-form');
    const nameInput = document.getElementById('customer-name');
    let selectedFlavor = null;

    flavorButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedFlavor = button.dataset.flavor;
            flavorButtons.forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
        });
    });

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!selectedFlavor) {
            alert('Por favor escoge un sabor antes de pedir.');
            return;
        }

        const name = nameInput.value.trim();
        const greeting = name ? `Hola, soy ${name}.` : 'Hola,';
        const message = `${greeting} Quiero pedir un jugo de ${selectedFlavor}.`;
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
    });
}