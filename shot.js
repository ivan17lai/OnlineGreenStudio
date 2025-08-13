let timerEnabled = false;
let isCountingDown = false; // ➕ 防止倒數重複觸發
let isBackendConnected = false; // Global flag for backend connection status
let uploadedImageUrl = ''; // To store the URL of the uploaded image
let photoSequenceNumber = 1; // For unique photo names

const timerButton = document.getElementById('timerButton');
const shotButton = document.getElementById('shotButton');
const timerIcon = timerButton.querySelector('span.material-icons');
const qrCodeButton = document.createElement('button'); // Create QR Code button
qrCodeButton.id = 'qrCodeButton';
qrCodeButton.className = 'toolbar-shotButton';
qrCodeButton.style.display = 'none'; // Hidden by default
qrCodeButton.innerHTML = '<span class="material-icons">qr_code_2</span>';

const toolbarCameraControl = document.querySelector('.toolbar-cameraControl');
toolbarCameraControl.insertBefore(qrCodeButton, document.getElementById('downloadButton')); // Insert before download button

const qrCodeDisplay = document.getElementById('qrCodeDisplay');
const qrCodeCanvas = document.getElementById('qrCodeCanvas');
const closeQrCodeButton = document.getElementById('closeQrCode');
const serverStatusIcon = document.getElementById('serverStatusIcon'); // Get server status icon

closeQrCodeButton.addEventListener('click', () => {
    qrCodeDisplay.style.display = 'none';
});

// Function to check backend status
async function checkBackendStatus() {
    try {
        const response = await fetch('http://localhost:3001/status');
        if (response.ok) {
            isBackendConnected = true;
            serverStatusIcon.style.display = 'flex'; // Show icon
            console.log('Backend server is connected.');
        } else {
            isBackendConnected = false;
            serverStatusIcon.style.display = 'none'; // Hide icon
            console.log('Backend server is not connected.');
        }
    } catch (error) {
        isBackendConnected = false;
        serverStatusIcon.style.display = 'none'; // Hide icon on error
        console.log('Backend server is not connected (error).', error);
    }
}

// Check backend status on load
checkBackendStatus();

// 切換 timer 狀態
timerButton.addEventListener('click', () => {
    timerEnabled = !timerEnabled;
    timerButton.style.backgroundColor = timerEnabled ? '#A2FFA0' : '#f2f2f2';
    timerIcon.textContent = timerEnabled ? 'timer_3_select' : 'timer_off';
});

// 快門按鈕點擊處理
shotButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default button action (e.g., form submission)
    console.log('Shot button clicked!');
    if (isCountingDown) return; // 🛑 正在倒數中就不處理

    if (timerEnabled) {
        isCountingDown = true;
        let countdown = 3;
        shotButton.textContent = countdown;

        const interval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                shotButton.textContent = countdown;
            } else {
                clearInterval(interval);
                shotButton.textContent = ''; // ✅ 清除文字
                isCountingDown = false;
                doAction();
            }
        }, 1000);
    } else {
        doAction();
    }
});

// QR Code button click handler
qrCodeButton.addEventListener('click', () => {
    console.log('QR Code button clicked!');
    if (uploadedImageUrl) {
        qrCodeDisplay.style.display = 'block';
        const qr = new QRious({ element: qrCodeCanvas, value: uploadedImageUrl, size: 200 });
    } else {
        console.error('No image URL to generate QR code.');
    }
});

function doAction() {
    console.log('doAction() started.');
    const outputCanvas = document.getElementById('outputCanvas');
    const shotedCanvas = document.getElementById('shotedCanvas');
    const shotedCtx = shotedCanvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');
    const shotButton = document.getElementById('shotButton');
    const noneButton = document.getElementById('noneButton');
    const reButton = document.getElementById('reButton');

    // 設定 shotedCanvas 尺寸與 outputCanvas 相同
    shotedCanvas.width = outputCanvas.width;
    shotedCanvas.height = outputCanvas.height;
    console.log('Canvas dimensions set.');

    // 複製 outputCanvas 的內容到 shotedCanvas
    shotedCtx.drawImage(outputCanvas, 0, 0);
    console.log('Output canvas drawn to shoted canvas.');

    // 繪製貼紙
    const stickerContainer = document.getElementById('sticker-container');
    const stickerWrappers = stickerContainer.querySelectorAll('.sticker-wrapper');
    const outputCanvasRect = outputCanvas.getBoundingClientRect();

    stickerWrappers.forEach(stickerWrapper => {
        const stickerImg = stickerWrapper.querySelector('.sticker');
        const stickerRect = stickerWrapper.getBoundingClientRect();

        // 計算貼紙相對於 outputCanvas 的位置和尺寸
        const dx = (stickerRect.left - outputCanvasRect.left) / outputCanvasRect.width * shotedCanvas.width;
        const dy = (stickerRect.top - outputCanvasRect.top) / outputCanvasRect.height * shotedCanvas.height;
        const dWidth = stickerRect.width / outputCanvasRect.width * shotedCanvas.width;
        const dHeight = stickerRect.height / outputCanvasRect.height * shotedCanvas.height;

        shotedCtx.drawImage(stickerImg, dx, dy, dWidth, dHeight);
    });
    console.log('Stickers drawn.');

    // 顯示控制項切換
    outputCanvas.style.display = 'none';
    shotedCanvas.style.display = 'flex';
    shotButton.style.display = 'none';

    if (isBackendConnected) {
        downloadButton.style.display = 'none';
        qrCodeButton.style.display = 'flex';
    } else {
        downloadButton.style.display = 'flex';
        qrCodeButton.style.display = 'none';
    }

    noneButton.style.display = 'none';
    reButton.style.display = 'flex';
    console.log('Button visibility updated.');

    // 禁用貼紙互動
    stickerContainer.classList.add('disabled-interactions');
    stickerFileInput.disabled = true;
    addStickerButton.disabled = true;
    console.log('Sticker interactions disabled.');

    // 上傳照片到本地伺服器
    shotedCanvas.toBlob(function(blob) {
        console.log('Attempting to upload blob.');
        const formData = new FormData();
        formData.append('photo', blob, 'captured_image.png'); // 'photo' 是伺服器預期的欄位名稱

        fetch('http://localhost:3001/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json()) // Expect JSON response
        .then(data => {
            console.log('伺服器回應:', data);
            if (data.url) {
                uploadedImageUrl = data.url;
                console.log('Uploaded image URL:', uploadedImageUrl);
            }
        })
        .catch(error => {
            console.error('上傳圖片時發生錯誤:', error);
        });
    }, 'image/png');

    console.log("✅ 拍攝完成或執行動作");
}

// 重設按鈕點擊處理
reButton.addEventListener('click', () => {
    console.log('Rebutton clicked!');
    const outputCanvas = document.getElementById('outputCanvas');
    const shotedCanvas = document.getElementById('shotedCanvas');
    const downloadButton = document.getElementById('downloadButton');
    const shotButton = document.getElementById('shotButton');
    const noneButton = document.getElementById('noneButton');
    const reButton = document.getElementById('reButton');

    outputCanvas.style.display = 'flex';
    shotedCanvas.style.display = 'none';
    shotButton.style.display = 'flex';

    // Reset button display based on backend connection
    if (isBackendConnected) {
        downloadButton.style.display = 'none';
        qrCodeButton.style.display = 'none'; // Hide QR code button when returning to shooting
    } else {
        downloadButton.style.display = 'flex';
        qrCodeButton.style.display = 'none';
    }

    noneButton.style.display = 'flex';
    reButton.style.display = 'none';
    console.log('Button visibility reset.');

    // 啟用貼紙互動
    stickerContainer.classList.remove('disabled-interactions');
    stickerFileInput.disabled = false;
    addStickerButton.disabled = false;
    console.log('Sticker interactions enabled.');

    // Hide QR code display
    qrCodeDisplay.style.display = 'none';
    uploadedImageUrl = ''; // Clear uploaded image URL

    const shotedCtx = shotedCanvas.getContext('2d');
    shotedCtx.clearRect(0, 0, shotedCanvas.width, shotedCanvas.height);
    console.log('Shoted canvas cleared.');

    console.log("🔄 狀態已重設");
});

// 下載按鈕點擊處理
downloadButton.addEventListener('click', () => {
    console.log('Download button clicked!');
    if (!isBackendConnected) { // Only download if backend is NOT connected
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const formattedDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;

        const photoName = `OGS${formattedDateTime}_${photoSequenceNumber}.png`;
        console.log('Generated Photo Name:', photoName);
        photoSequenceNumber++; // Increment for next photo
    } else {
        // This part should ideally not be reached if QR code button is shown
        // But as a fallback, if backend is connected, still download
        const shotedCanvas = document.getElementById('shotedCanvas');
        const link = document.createElement('a');
        link.href = shotedCanvas.toDataURL('image/png');
        link.download = 'shot.png';
        link.click();
        console.log("⬇️ 已下載拍攝圖片");
    }
});