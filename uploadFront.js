let selectedImageFront = null;
let lastActiveFront = null;
let debounceTimerFront = null;

// Add default foreground image
function addDefaultForegroundImage() {
  const defaultSrc = './onlinegreen.png';
  const img = document.createElement('img');
  img.className = 'thumbnail';
  img.src = defaultSrc;
  img.id = 'defaultForeground'; // Add an ID to easily identify and remove it

  img.addEventListener('click', () => {
    handleImageClickFront(img, defaultSrc);
  });

  img.onload = () => {
    imageStripFront.insertBefore(img, document.getElementById('addForegroundButton').nextSibling);
    updateUploadCountFront();
    handleImageClickFront(img, defaultSrc); // Select it by default
  };
}

// Call on load
addDefaultForegroundImage();

const fileInputFront = document.getElementById('foregroundFileInput');
const imageStripFront = document.getElementById('foregroundImageStrip');
const uploadCountFront = document.getElementById('foregroundUploadCount');
const containerFront = document.querySelector('.image-scroll-container');

// 處理點擊圖片
function handleImageClickFront(imgElementFront, srcFront) {
  console.log('選擇的前景圖片:', srcFront);
  selectedImageFront = imgElementFront;

  // 移除所有縮圖的 'selected' 樣式
  document.querySelectorAll('#foregroundImageStrip .thumbnail').forEach(thumbnail => {
    thumbnail.classList.remove('selected');
  });
  imgElementFront.classList.add('selected');

  // 這裡假設設定前景圖片的函數是 setSelectedForeground
  if (typeof setSelectedForeground === 'function') {
    setSelectedForeground(srcFront);
  } else {
    console.error("無法設定前景圖片：setSelectedForeground 未定義");
  }
}

// 點擊「新增圖片」按鈕 ➜ 開啟檔案選擇器
document.getElementById('addForegroundButton').addEventListener('click', () => {
  fileInputFront.click();
});

// 上傳圖片處理
fileInputFront.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);

  // Remove default image if new images are uploaded
  const defaultFg = document.getElementById('defaultForeground');
  if (defaultFg) {
    defaultFg.remove();
  }

  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const srcFront = URL.createObjectURL(file);

      const imgFront = document.createElement('img');
      imgFront.className = 'thumbnail';
      imgFront.src = srcFront;

      imgFront.addEventListener('click', () => {
        handleImageClickFront(imgFront, srcFront);
      });

      imgFront.onload = () => {
        imageStripFront.insertBefore(imgFront, document.getElementById('addForegroundButton').nextSibling);
        updateUploadCountFront();
      };

      imgFront.onerror = () => {
        console.error('圖片載入失敗，無法作為縮圖顯示:', srcFront);
      };
    }
  });

  fileInputFront.value = '';
});

// 更新上傳數量
function updateUploadCountFront() {
  const thumbnailsFront = imageStripFront.querySelectorAll('img.thumbnail');
  uploadCountFront.textContent = `(已上傳 ${thumbnailsFront.length} 張)`;
}