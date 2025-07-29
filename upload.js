const addButton = document.getElementById('addButton');
const fileInput = document.getElementById('fileInput');
const imageStrip = document.getElementById('imageStrip');
const uploadCount = document.getElementById('uploadCount');
const container = document.querySelector('.image-scroll-container');

let selectedImage = null;
let lastActive = null;
let debounceTimer = null;

// 處理點擊圖片
function handleImageClick(imgElement, src) {
  console.log('選擇的圖片:', src);
  selectedImage = imgElement;

  document.querySelectorAll('.thumbnail').forEach(thumbnail => {
    thumbnail.classList.remove('selected');
  });
  imgElement.classList.add('selected');

  if (typeof setSelectedBackground === 'function') {
    setSelectedBackground(src);
  } else {
    console.error("無法設定背景：setSelectedBackground 未定義");
  }
}

// 點擊「新增圖片」按鈕 ➜ 開啟檔案選擇器
addButton.addEventListener('click', () => {
  fileInput.click();
});

// 上傳圖片處理
fileInput.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);

  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const src = URL.createObjectURL(file);

      const img = document.createElement('img');
      img.className = 'thumbnail';
      img.src = src;

      img.addEventListener('click', () => {
        handleImageClick(img, src);
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

// 更新上傳數量
function updateUploadCount() {
  const thumbnails = imageStrip.querySelectorAll('img.thumbnail');
  uploadCount.textContent = `(已上傳 ${thumbnails.length} 張)`;
}

// 滑動時自動觸發靠左圖片的 click
container.addEventListener('scroll', () => {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const containerLeft = container.scrollLeft;

    const thumbnails = document.querySelectorAll('.thumbnail');
    let closest = null;
    let closestDistance = Infinity;

    thumbnails.forEach(thumb => {
      const offset = thumb.offsetLeft - containerLeft;
      const distance = Math.abs(offset);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = thumb;
      }
    });

    if (closest && closest !== lastActive) {
      lastActive = closest;
      console.log('自動觸發點擊：', closest);
      closest.click(); // 觸發使用者定義的邏輯
    }
  }, 100);
});
