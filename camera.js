const video = document.getElementById('videoInput');
const canvas = document.getElementById('outputCanvas');
const cameraSelect = document.getElementById('cameraSelect');
const ctx = canvas.getContext('2d');

let currentStream = null;
let selectedImgElement = null;

const selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`,
});
selfieSegmentation.setOptions({ modelSelection: 1 });
selfieSegmentation.onResults(onResults);

async function drawToCanvas() {
    if (video.readyState === 4) {
        await selfieSegmentation.send({ image: video });
    }
    requestAnimationFrame(drawToCanvas);
}

function onResults(results) {
    const width = canvas.width;
    const height = canvas.height;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");

    // 將人像遮罩繪製到 tempCanvas
    tempCtx.drawImage(results.image, 0, 0, width, height);
    tempCtx.globalCompositeOperation = "destination-in";
    tempCtx.drawImage(results.segmentationMask, 0, 0, width, height);
    tempCtx.globalCompositeOperation = "source-over";

    // 清空畫布
    ctx.clearRect(0, 0, width, height);

    // 繪製背景（保持比例並裁切）
    if (selectedImgElement) {
        const img = selectedImgElement;
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;

        let sx, sy, sWidth, sHeight;

        if (imgAspect > canvasAspect) {
            // 圖片太寬，要裁左右
            sHeight = img.height;
            sWidth = sHeight * canvasAspect;
            sx = (img.width - sWidth) / 2;
            sy = 0;
        } else {
            // 圖片太高，要裁上下
            sWidth = img.width;
            sHeight = sWidth / canvasAspect;
            sx = 0;
            sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
    } else {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, width, height);
    }

    // 將人像覆蓋在背景上
    ctx.drawImage(tempCanvas, 0, 0, width, height);
}

async function startCamera(deviceId) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const constraints = {
            video: { deviceId: { exact: deviceId } }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        currentStream = stream;

        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            drawToCanvas();
        });
    } catch (error) {
        console.error('無法啟動攝影機：', error);
    }
}

async function getCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    cameraSelect.innerHTML = '';
    videoDevices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${index + 1}`;
        cameraSelect.appendChild(option);
    });
}

cameraSelect.addEventListener('change', () => {
    startCamera(cameraSelect.value);
});

function setSelectedBackground(url) {
    selectedImage = url;
    selectedImgElement = new Image();
    selectedImgElement.crossOrigin = "anonymous";
    selectedImgElement.src = url;
    selectedImgElement.onload = () => {
        console.log("背景圖片載入完成");
    };
}

async function init() {
    await getCameras();
    if (cameraSelect.options.length > 0) {
        startCamera(cameraSelect.value);
    }
}

init();
