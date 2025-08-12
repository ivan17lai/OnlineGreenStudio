const stickerContainer = document.getElementById('sticker-container');
const stickerFileInput = document.getElementById('stickerFileInput');
const stickerUploadCount = document.getElementById('stickerUploadCount');
const stickerImageStrip = document.getElementById('stickerImageStrip');

let stickerCount = 0;

// Add default sticker image
function addDefaultStickerImage() {
    const defaultSrc = './onlinegreenSticker.png';
    const img = document.createElement('img');
    img.className = 'thumbnail sticker-thumbnail';
    img.src = defaultSrc;
    img.id = 'defaultSticker'; // Add an ID to easily identify and remove it

    img.addEventListener('click', () => {
        addStickerToCanvas(defaultSrc);
    });

    img.onload = () => {
        stickerImageStrip.insertBefore(img, document.getElementById('addStickerButton').nextSibling);
        stickerCount++;
        stickerUploadCount.textContent = `(已上傳 ${stickerCount} 張)`;
    };
}

// Call on load
addDefaultStickerImage();

document.getElementById('addStickerButton').addEventListener('click', () => stickerFileInput.click());

stickerFileInput.addEventListener('change', (event) => {
    const files = event.target.files;

    // Remove default sticker if new stickers are uploaded
    const defaultSticker = document.getElementById('defaultSticker');
    if (defaultSticker) {
        defaultSticker.remove();
        stickerCount--; // Decrement count as default is removed
    }

    if (files.length > 0) {
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                createStickerThumbnail(e.target.result);
                stickerCount++;
                stickerUploadCount.textContent = `(已上傳 ${stickerCount} 張)`;
            };
            reader.readAsDataURL(file);
        }
    }
});

function createStickerThumbnail(src) {
    const thumbnailDiv = document.createElement('div');
    thumbnailDiv.classList.add('thumbnail', 'sticker-thumbnail');
    thumbnailDiv.style.backgroundImage = `url(${src})`;
    thumbnailDiv.style.backgroundSize = 'contain';
    thumbnailDiv.style.backgroundRepeat = 'no-repeat';
    thumbnailDiv.style.backgroundPosition = 'center';

    thumbnailDiv.addEventListener('click', () => addStickerToCanvas(src));

    stickerImageStrip.appendChild(thumbnailDiv);
}

function addStickerToCanvas(src) {
    const stickerWrapper = document.createElement('div');
    stickerWrapper.classList.add('sticker-wrapper');

    const img = document.createElement('img');
    img.src = src;
    img.classList.add('sticker');
    stickerWrapper.appendChild(img);

    // Set initial size based on image aspect ratio
    img.onload = () => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        const aspectRatio = naturalWidth / naturalHeight;

        const maxSize = 150; // Max initial size for either dimension
        let initialWidth = maxSize;
        let initialHeight = maxSize;

        if (naturalWidth > naturalHeight) {
            initialHeight = maxSize / aspectRatio;
        } else {
            initialWidth = maxSize * aspectRatio;
        }

        stickerWrapper.style.width = `${initialWidth}px`;
        stickerWrapper.style.height = `${initialHeight}px`;

        // Make draggable and resizable after initial size is set
        makeDraggable(stickerWrapper);
        makeResizable(stickerWrapper, resizeHandle);
    };

    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle');
    stickerWrapper.appendChild(resizeHandle);

    stickerContainer.appendChild(stickerWrapper);

    stickerWrapper.addEventListener('dblclick', () => {
        stickerWrapper.remove();
    });
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function makeResizable(element, handle) {
    handle.onmousedown = function(e) {
        e.preventDefault();
        e.stopPropagation(); // Stop drag event from firing

        let startX = e.clientX;
        let startY = e.clientY;
        let startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
        let startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
        let aspectRatio = startWidth / startHeight;

        document.onmousemove = function(e) {
            let newWidth = startWidth + (e.clientX - startX);
            let newHeight = startHeight + (e.clientY - startY);

            // Maintain aspect ratio
            if (Math.abs(e.clientX - startX) > Math.abs(e.clientY - startY)) {
                newHeight = newWidth / aspectRatio;
            } else {
                newWidth = newHeight * aspectRatio;
            }

            element.style.width = newWidth > 20 ? newWidth + 'px' : '20px';
            element.style.height = newHeight > 20 ? newHeight + 'px' : '20px';
        };

        document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
}