const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const modeSelect = document.getElementById('modeSelect');

let isTracking = false;
let currentMode = 'single'; // Default mode

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 30, max: 60 } },
        audio: false,
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function main() {
    await setupCamera();
    video.play();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const model = await handpose.load({
        maxContinuousChecks: 10,
        detectionConfidence: 0.8,
        iouThreshold: 0.3,
    });
    detectHands(model);
}

async function detectHands(model) {
    const predictions = await model.estimateHands(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    predictions.forEach(prediction => {
        const keypoints = prediction.landmarks;

        ctx.fillStyle = '#ff7846'; /* Orange color */
        keypoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
            ctx.fill();
        });
    });

    if (isTracking) {
        requestAnimationFrame(() => detectHands(model));
    }
}

startButton.addEventListener('click', () => {
    isTracking = true;
    main();
});

stopButton.addEventListener('click', () => {
    isTracking = false;
});

modeSelect.addEventListener('change', () => {
    currentMode = modeSelect.value;
    if (currentMode === 'dual') {
        console.log('Switched to Dual Hand Mode');
        // Adjust camera and canvas positioning for dual hands
        video.style.transform = 'scaleX(-1)'; // Flip camera view horizontally
        video.style.width = '50%';
        canvas.width = video.videoWidth / 2;
        canvas.height = video.videoHeight;
    } else {
        console.log('Switched to Single Hand Mode');
        // Reset camera and canvas for single hand tracking
        video.style.transform = 'scaleX(1)';
        video.style.width = '100%';
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }
});
