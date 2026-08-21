const videoConfig = {
    mp4: 'muse-video.mp4'
};

// Scroll should scrub the entire video, start to finish
const VIDEO_START_TIME = 0;

const video = document.getElementById('scroll-video');
const sections = document.querySelectorAll('.section-card');
const loadingOverlay = document.getElementById('loading-overlay');

function loadVideo() {
    const source = document.createElement('source');
    source.src = videoConfig.mp4;
    source.type = 'video/mp4';
    video.appendChild(source);

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
    const track = document.getElementById('scroll-track');
    const scrollTop = window.scrollY;
    const trackHeight = track.scrollHeight - window.innerHeight;
    
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