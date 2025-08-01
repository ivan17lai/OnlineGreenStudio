const addButtonFront = document.getElementById('addForegroundButton');
const fileInputFront = document.getElementById('foregroundFileInput');
const imageStripFront = document.getElementById('foregroundImageStrip');
const uploadCountFront = document.getElementById('foregroundUploadCount');
const containerFront = document.querySelector('.image-scroll-container');

let selectedImageFront = null;
let lastActiveFront = null;
let debounceTimerFront = null;

// 處理點擊圖片
function handleImageClickFront(imgElementFront, srcFront) {
  console.log('選擇的前景圖片:', srcFront);
  selectedImageFront = imgElementFront;

  // 移除所有縮圖的 'selected' 樣式
  document.querySelectorAll('#foregroundImageStrip .thumbnail').forEach(thumbnail => {
    thumbnail.classList.remove('selected');
  });
  imgElementFront.classList.add('selected');

  // 這裡假設設定前景圖片的函數是 setForegroundImage
  if (typeof setSelectedForeground === 'function') {
    setSelectedForeground(srcFront);
  } else {
    console.error("無法設定前景圖片：setSelectedForeground 未定義");
  }
}

// 點擊「新增圖片」按鈕 ➜ 開啟檔案選擇器
addButtonFront.addEventListener('click', () => {
  fileInputFront.click();
});

// 上傳圖片處理
fileInputFront.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);

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
        imageStripFront.insertBefore(imgFront, addButtonFront.nextSibling);
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

// 滑動時自動觸發靠左圖片的 click
containerFront.addEventListener('scroll', () => {
  if (debounceTimerFront) clearTimeout(debounceTimerFront);

  debounceTimerFront = setTimeout(() => {
    const containerLeftFront = containerFront.scrollLeft;

    // 只選擇當前 container 內的縮圖
    const thumbnailsFront = containerFront.querySelectorAll('.thumbnail');
    let closestFront = null;
    let closestDistanceFront = Infinity;

    thumbnailsFront.forEach(thumbFront => {
      const offsetFront = thumbFront.offsetLeft - containerLeftFront;
      const distanceFront = Math.abs(offsetFront);
      if (distanceFront < closestDistanceFront) {
        closestDistanceFront = distanceFront;
        closestFront = thumbFront;
      }
    });

    if (closestFront && closestFront !== lastActiveFront) {
      lastActiveFront = closestFront;
      console.log('自動觸發點擊：', closestFront);
      closestFront.click(); // 觸發使用者定義的邏輯
    }
  }, 100);
});