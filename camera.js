const video = document.getElementById('videoInput');
const canvas = document.getElementById('outputCanvas');
const cameraSelect = document.getElementById('cameraSelect');
const ctx = canvas.getContext('2d');

let currentStream = null;
let selectedImage = null; // <== 你的背景圖會設定在這
let selectedImgElement = null; // 實際繪製用的 img 元件

// 🧠 初始化 MediaPipe Selfie Segmentation
const selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`,
});
selfieSegmentation.setOptions({ modelSelection: 1 });
selfieSegmentation.onResults(onResults);

// 🔁 每一幀處理
async function drawToCanvas() {
    if (video.readyState === 4) {
        await selfieSegmentation.send({ image: video });
    }
    requestAnimationFrame(drawToCanvas);
}

// 💡 合成人物與背景
function onResults(results) {
    const width = canvas.width;
    const height = canvas.height;

    // 1. 建立 temp canvas 保存人物區塊
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");

    // 2. 繪製人物影像
    tempCtx.drawImage(results.image, 0, 0, width, height);
    tempCtx.globalCompositeOperation = "destination-in";
    tempCtx.drawImage(results.segmentationMask, 0, 0, width, height);
    tempCtx.globalCompositeOperation = "source-over";

    // 3. 先畫背景
    ctx.clearRect(0, 0, width, height);
    if (selectedImgElement) {
        ctx.drawImage(selectedImgElement, 0, 0, width, height);
    } else {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, width, height);
    }

    // 4. 畫上人物（已去背）
    ctx.drawImage(tempCanvas, 0, 0, width, height);
}

// 🎥 啟動攝影機
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

// 📷 攝影機選擇
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

// 監聽選單變更
cameraSelect.addEventListener('change', () => {
    startCamera(cameraSelect.value);
});

// 🖼️ 設定背景圖片：selectedImage 是 blob 連結
function setSelectedBackground(url) {
    selectedImage = url;
    selectedImgElement = new Image();
    selectedImgElement.crossOrigin = "anonymous"; // 避免 CORS 問題（如同源）
    selectedImgElement.src = url;
    selectedImgElement.onload = () => {
        console.log("背景圖片載入完成");
    };
}

// 🚀 初始化
async function init() {
    await getCameras();
    if (cameraSelect.options.length > 0) {
        startCamera(cameraSelect.value);
    }
}

// ✅ 呼叫一次初始化
init();
