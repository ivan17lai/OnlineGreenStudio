let timerEnabled = false;

const timerButton = document.getElementById('timerButton');
const shotButton = document.getElementById('shotButton');
const timerIcon = timerButton.querySelector('span.material-icons');

// 切換 timer 狀態
timerButton.addEventListener('click', () => {
    timerEnabled = !timerEnabled;

    // 切換背景顏色
    timerButton.style.backgroundColor = timerEnabled ? '#A2FFA0' : '#f2f2f2';

    // 切換圖示
    timerIcon.textContent = timerEnabled ? 'timer_3_select' : 'timer_off';
});

// 快門按鈕點擊處理
shotButton.addEventListener('click', () => {
    if (timerEnabled) {
        let countdown = 3;
        shotButton.textContent = countdown;

        const interval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                shotButton.textContent = countdown;
            } else {
                clearInterval(interval);
                shotButton.textContent = ''; // ✅ 倒數完清除文字
                doAction();
            }
        }, 1000);
    } else {
        doAction(); // 不改變文字
    }
});

function doAction() {
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

    // 複製 outputCanvas 的內容到 shotedCanvas
    shotedCtx.drawImage(outputCanvas, 0, 0);

    // 交換顯示
    outputCanvas.style.display = 'none';
    shotedCanvas.style.display = 'flex';

    // 顯示下載按鈕
    shotButton.style.display = 'none';
    downloadButton.style.display = 'flex';

    // 顯示 noneButton，隱藏 reButton
    noneButton.style.display = 'none';
    reButton.style.display = 'flex';

    console.log("✅ 拍攝完成或執行動作");
}

// 重設按鈕點擊處理
reButton.addEventListener('click', () => {
    const outputCanvas = document.getElementById('outputCanvas');
    const shotedCanvas = document.getElementById('shotedCanvas');
    const downloadButton = document.getElementById('downloadButton');
    const shotButton = document.getElementById('shotButton');
    const noneButton = document.getElementById('noneButton');
    const reButton = document.getElementById('reButton');

    // 顯示 outputCanvas，隱藏 shotedCanvas
    outputCanvas.style.display = 'flex';
    shotedCanvas.style.display = 'none';

    // 顯示快門按鈕，隱藏下載按鈕
    shotButton.style.display = 'flex';
    downloadButton.style.display = 'none';

    // 顯示 noneButton，隱藏 reButton
    noneButton.style.display = 'flex';
    reButton.style.display = 'none';

    // 清除 shotedCanvas 內容
    const shotedCtx = shotedCanvas.getContext('2d');
    shotedCtx.clearRect(0, 0, shotedCanvas.width, shotedCanvas.height);

    console.log("🔄 狀態已重設");
});

// 下載按鈕點擊處理
downloadButton.addEventListener('click', () => {
    const shotedCanvas = document.getElementById('shotedCanvas');
    const link = document.createElement('a');
    link.href = shotedCanvas.toDataURL('image/png');
    link.download = 'shot.png';
    link.click();
    console.log("⬇️ 已下載拍攝圖片");
});