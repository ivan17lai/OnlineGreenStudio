const video = document.getElementById('videoInput');
const canvas = document.getElementById('outputCanvas');
const cameraSelect = document.getElementById('cameraSelect');
const ctx = canvas.getContext('2d');

let currentStream = null;
let selectedBackgroundImgElement = null;
let selectedForegroundImgElement = null; // 新增前景圖片變數

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

    // 清空畫布
    ctx.clearRect(0, 0, width, height);

    // 1. 繪製背景（最底層）
    if (selectedBackgroundImgElement) { // 如果有選擇背景圖片
        const img = selectedBackgroundImgElement;
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
        // 如果沒有選擇背景圖片，則填充灰色背景
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, width, height);
    }

    // 2. 繪製人物（中間層）
    // 建立一個臨時畫布來處理人像遮罩
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    
    tempCtx.drawImage(results.image, 0, 0, width, height);
    tempCtx.globalCompositeOperation = "destination-in";
    tempCtx.drawImage(results.segmentationMask, 0, 0, width, height);
    tempCtx.globalCompositeOperation = "source-over";

    ctx.drawImage(tempCanvas, 0, 0, width, height);

    // 3. 繪製前景（最上層，**不進行遮罩**）
    if (selectedForegroundImgElement) {
        const foregroundImg = selectedForegroundImgElement;
        
        // 繪製前景圖片到主畫布上，不使用任何遮罩
        ctx.drawImage(foregroundImg, 0, 0, width, height);
    }
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
    selectedBackgroundImgElement = new Image();
    selectedBackgroundImgElement.crossOrigin = "anonymous";
    selectedBackgroundImgElement.src = url;
    selectedBackgroundImgElement.onload = () => {
        console.log("背景圖片載入完成");
    };
}

// 新增設置前景圖片的函數
function setSelectedForeground(url) {
    selectedForegroundImgElement = new Image();
    selectedForegroundImgElement.crossOrigin = "anonymous";
    selectedForegroundImgElement.src = url;
    selectedForegroundImgElement.onload = () => {
        console.log("前景圖片載入完成");
    };
}

async function init() {
    try {
        // 嘗試先請求權限，確認使用者有授權
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // 先停止，不直接使用這個 stream

        // 如果成功，載入攝影機清單
        await getCameras();

        if (cameraSelect.options.length > 0) {
            startCamera(cameraSelect.value);
        } else {
            alert("找不到任何攝影機裝置，請確認已連接並允許使用。");
        }

    } catch (error) {
        console.error("無法存取攝影機權限：", error);
        alert("請允許攝影機權限，否則無法啟動。請至瀏覽器設定中允許攝影機權限。");
    }
}

init();