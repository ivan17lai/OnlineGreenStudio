let timerEnabled = false;
let isCountingDown = false; // ➕ 防止倒數重複觸發

const timerButton = document.getElementById('timerButton');
const shotButton = document.getElementById('shotButton');
const timerIcon = timerButton.querySelector('span.material-icons');

// 切換 timer 狀態
timerButton.addEventListener('click', () => {
    timerEnabled = !timerEnabled;
    timerButton.style.backgroundColor = timerEnabled ? '#A2FFA0' : '#f2f2f2';
    timerIcon.textContent = timerEnabled ? 'timer_3_select' : 'timer_off';
});

// 快門按鈕點擊處理
shotButton.addEventListener('click', () => {
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

    // 顯示控制項切換
    outputCanvas.style.display = 'none';
    shotedCanvas.style.display = 'flex';
    shotButton.style.display = 'none';
    downloadButton.style.display = 'flex';
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

    outputCanvas.style.display = 'flex';
    shotedCanvas.style.display = 'none';
    shotButton.style.display = 'flex';
    downloadButton.style.display = 'none';
    noneButton.style.display = 'flex';
    reButton.style.display = 'none';

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
