/**
 * Popup Love Message Application Logic
 */

const CONFIG = {
    popupCount: 150,      // Total random popups before finale
    popupInterval: 50,    // Speed of random popups
    popupDuration: 5000,  // Duration of random popups
    heartInterval: 400,   // Floating background hearts
    heartLifetime: 4000,
    mosaicCount: 60,      // Number of images in the final heart shape
    images: [
        "photo1.png",
        "photo2.png",
        "photo3.jpg",
        "photo4.jpg",
        "photo5.jpg"
    ]
};

const DOM = {
    startDialog: document.getElementById("startDialog"),
    finalMessage: document.getElementById("finalMessage"),
    audio: document.getElementById("backgroundMusic"),
    body: document.body
};

/**
 * Background Floating Hearts
 */
function createHeart() {
    const heart = document.createElement("div");
    heart.className = "heart";
    const x = Math.random() * window.innerWidth;
    heart.style.left = `${x}px`;
    heart.style.bottom = "0";
    DOM.body.appendChild(heart);
    setTimeout(() => heart.remove(), CONFIG.heartLifetime);
}

/**
 * Random Temporary Popups (Phase 1)
 */
function createPopup() {
    const img = document.createElement("img");
    img.className = "popup";
    const randomImage = CONFIG.images[Math.floor(Math.random() * CONFIG.images.length)];
    img.src = `assets/images/${randomImage}`;

    const size = 80;
    const maxWidth = window.innerWidth - size;
    const maxHeight = window.innerHeight - size;

    img.style.left = `${Math.random() * Math.max(0, maxWidth)}px`;
    img.style.top = `${Math.random() * Math.max(0, maxHeight)}px`;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;

    DOM.body.appendChild(img);
    setTimeout(() => img.remove(), CONFIG.popupDuration);
}

/**
 * Main Sequence
 */
function startPopups(count) {
    let created = 0;
    const interval = setInterval(() => {
        if (created >= count) {
            clearInterval(interval);
            // TriggerPhase 2: Heart Mosaic
            createHeartMosaic();
            return;
        }
        createPopup();
        created++;
    }, CONFIG.popupInterval);
}

/**
 * Phase 2: Create images that gather into a heart shape
 */
function createHeartMosaic() {
    const heartImages = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Create elements first
    for (let i = 0; i < CONFIG.mosaicCount; i++) {
        const img = document.createElement("img");
        img.className = "heart-shape-popup";
        const randomImage = CONFIG.images[Math.floor(Math.random() * CONFIG.images.length)];
        img.src = `assets/images/${randomImage}`;

        // Start from random positions outside or edges
        const startX = (Math.random() - 0.5) * window.innerWidth * 1.5 + centerX;
        const startY = (Math.random() - 0.5) * window.innerHeight * 1.5 + centerY;

        img.style.left = `${startX}px`;
        img.style.top = `${startY}px`;

        DOM.body.appendChild(img);
        heartImages.push(img);
    }

    // Force reflow
    setTimeout(() => {
        heartImages.forEach((img, index) => {
            // Heart Curve Parametric Equations
            // t goes from 0 to 2*PI
            const t = (index / CONFIG.mosaicCount) * 2 * Math.PI;

            // Heart formula:
            // x = 16 * sin(t)^3
            // y = 13 * cos(t) - 5*cos(2t) - 2*cos(3t) - cos(4t)

            // Adjust scale based on screen size (min of width/height)
            const scale = Math.min(window.innerWidth, window.innerHeight) / 35;

            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

            // Calculate final position (centered)
            // Subtract half image size (25px) to center perfectly
            const finalX = centerX + (x * scale) - 25;
            const finalY = centerY + (y * scale) - 25;

            img.style.left = `${finalX}px`;
            img.style.top = `${finalY}px`;
            img.classList.add('active'); // Triggers opacity/scale transition
        });

        // Phase 3: Show Final Message after mosaic forms
        setTimeout(showFinalMessage, 3000); // 3s delay matches CSS transition + buffer

    }, 100);
}

function showFinalMessage() {
    if (DOM.finalMessage) {
        DOM.finalMessage.classList.remove("hidden");
        DOM.finalMessage.style.display = 'block';
    }
}

/**
 * Initialization
 */
function init() {
    setInterval(createHeart, CONFIG.heartInterval);

    const startHandler = () => {
        DOM.startDialog.style.display = "none";
        DOM.audio.play().catch(console.warn);

        // Fullscreen
        const elem = document.documentElement;
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();

        startPopups(CONFIG.popupCount);
        document.removeEventListener("click", startHandler);
    };

    document.addEventListener("click", startHandler);
}

document.addEventListener('DOMContentLoaded', init);
