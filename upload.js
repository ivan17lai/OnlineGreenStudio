const fileInput = document.getElementById('fileInput');
const imageStrip = document.getElementById('imageStrip');
const uploadCount = document.getElementById('uploadCount');
const container = document.querySelector('.image-scroll-container');

let selectedImage = null;
let lastActive = null;
let debounceTimer = null;

// Add default background image
function addDefaultBackgroundImage() {
  const defaultSrc = './onlinegreenBackground.png';
  const img = document.createElement('img');
  img.className = 'thumbnail';
  img.src = defaultSrc;
  img.id = 'defaultBackground'; // Add an ID to easily identify and remove it

  img.addEventListener('click', () => {
    handleImageClick(img, defaultSrc);
  });

  img.onload = () => {
    imageStrip.insertBefore(img, document.getElementById('addButton').nextSibling);
    updateUploadCount();
    handleImageClick(img, defaultSrc); // Select it by default
  };
}

// Call on load
addDefaultBackgroundImage();

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

document.getElementById('addButton').addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);

  // Remove default image if new images are uploaded
  const defaultBg = document.getElementById('defaultBackground');
  if (defaultBg) {
    defaultBg.remove();
  }

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
        imageStrip.insertBefore(img, document.getElementById('addButton').nextSibling);
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

function updateUploadCount() {
  const thumbnails = imageStrip.querySelectorAll('img.thumbnail');
  uploadCount.textContent = `(已上傳 ${thumbnails.length} 張)`;
}
