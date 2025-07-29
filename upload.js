const addButton = document.getElementById('addButton');
const fileInput = document.getElementById('fileInput');
const imageStrip = document.getElementById('imageStrip');
const uploadCount = document.getElementById('uploadCount');

let selectedImage = null;

addButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);

    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const src = URL.createObjectURL(file);

            const img = document.createElement('img');
            img.className = 'thumbnail';
            img.src = src;

            img.addEventListener('click', () => {
                console.log('選擇的圖片:', src);
                selectedImage = img;
                document.querySelectorAll('.thumbnail').forEach(thumbnail => {
                    thumbnail.classList.remove('selected');
                });
                img.classList.add('selected');

                // 👉 呼叫 camera.js 的函式來替換背景
                if (typeof setSelectedBackground === 'function') {
                    setSelectedBackground(src);
                } else {
                    console.error("無法設定背景：setSelectedBackground 未定義");
                }
            });


            img.onload = () => {
                imageStrip.insertBefore(img, addButton.nextSibling);
                updateUploadCount();
            };

            img.onerror = () => {
                console.error('圖片載入失敗，無法作為縮圖顯示:', src);
            };
        }
    });

    fileInput.value = '';
});

function updateUploadCount() {
    const thumbnails = imageStrip.querySelectorAll('img.thumbnail');
    uploadCount.textContent = `(已上傳 ${thumbnails.length} 張)`;
}

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('addButton');
    const fileInput = document.getElementById('fileInput');
    const imageStrip = document.getElementById('imageStrip');
    const uploadCount = document.getElementById('uploadCount');

    let selectedImage = null;
});
