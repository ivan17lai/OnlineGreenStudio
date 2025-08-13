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
    let stickerCount = 0;
let selectedSticker = null; // Global variable to track the selected sticker
let deselectListener = null; // To store the temporary deselect listener

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
        makeResizable(stickerWrapper, stickerWrapper.querySelector('.resize-handle'));
    };

    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle');
    const rotateIcon = document.createElement('span');
    rotateIcon.classList.add('material-icons');
    rotateIcon.textContent = 'zoom_out_map'; // Default to resize icon
    resizeHandle.appendChild(rotateIcon);
    stickerWrapper.appendChild(resizeHandle);

    // Set initial mode for the sticker
    stickerWrapper.dataset.mode = 'resize';

    stickerContainer.appendChild(stickerWrapper);

    // Select the newly added sticker by default
    selectSticker(stickerWrapper);

    // Add click listener for selection
    stickerWrapper.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from deselecting immediately
        selectSticker(stickerWrapper);
    });

    // Toggle resize/rotate mode on handle click
    resizeHandle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent sticker selection
        if (stickerWrapper.dataset.mode === 'resize') {
            stickerWrapper.dataset.mode = 'rotate';
            rotateIcon.textContent = 'autorenew';
            resizeHandle.style.cursor = 'grab'; // Change cursor for rotation
        } else {
            stickerWrapper.dataset.mode = 'resize';
            rotateIcon.textContent = 'zoom_out_map';
            resizeHandle.style.cursor = 'nwse-resize'; // Change cursor for resize
        }
    });

    stickerWrapper.addEventListener('dblclick', () => {
        stickerWrapper.remove();
        if (selectedSticker === stickerWrapper) {
            selectedSticker = null;
        }
    });
}

function selectSticker(stickerWrapper) {
    if (selectedSticker && selectedSticker !== stickerWrapper) {
        deselectSticker(selectedSticker);
    }
    if (selectedSticker !== stickerWrapper) {
        stickerWrapper.classList.add('selected');
        selectedSticker = stickerWrapper;
        // Attach event listeners for drag/resize/rotate
        makeDraggable(stickerWrapper);
        makeResizable(stickerWrapper, stickerWrapper.querySelector('.resize-handle'));

        // Add temporary deselect listener to document
        deselectListener = (e) => {
            if (selectedSticker && !selectedSticker.contains(e.target)) {
                deselectSticker(selectedSticker);
            }
        };
        document.addEventListener('click', deselectListener);
    }
}

function deselectSticker(stickerWrapper) {
    stickerWrapper.classList.remove('selected');
    // Remove event listeners for drag/resize/rotate
    stickerWrapper.onmousedown = null;
    const resizeHandle = stickerWrapper.querySelector('.resize-handle');
    if (resizeHandle) {
        resizeHandle.onmousedown = null;
        // Reset mode and icon when deselected
        stickerWrapper.dataset.mode = 'resize';
        resizeHandle.querySelector('.material-icons').textContent = 'zoom_out_map';
        resizeHandle.style.cursor = 'nwse-resize';
    }
    selectedSticker = null;

    // Remove temporary deselect listener from document
    if (deselectListener) {
        document.removeEventListener('click', deselectListener);
        deselectListener = null;
    }
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Only drag if not in rotation mode (when clicking on the handle)
        if (e.target.classList.contains('resize-handle') && element.dataset.mode === 'rotate') {
            // If in rotate mode and clicking handle, let makeResizable handle it
            return;
        }
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
    let currentRotation = 0;

    // Function to get the current rotation from the element's transform style
    function getRotationDegrees(element) {
        const style = window.getComputedStyle(element);
        const transform = style.getPropertyValue('transform');
        if (transform === 'none') return 0;
        const matrix = transform.split('(')[1].split(')')[0].split(',');
        const a = matrix[0];
        const b = matrix[1];
        const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        return (angle < 0) ? angle + 360 : angle;
    }

    handle.onmousedown = function(e) {
        e.preventDefault();
        e.stopPropagation(); // Stop drag event from firing

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
        const startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
        const aspectRatio = startWidth / startHeight;

        // Get sticker's position and dimensions relative to the viewport
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate initial angle for rotation
        const initialAngle = Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);
        currentRotation = getRotationDegrees(element);

        document.onmousemove = function(e) {
            if (element.dataset.mode === 'rotate') { // Rotation mode
                const currentMouseX = e.clientX;
                const currentMouseY = e.clientY;
                const currentAngle = Math.atan2(currentMouseY - centerY, currentMouseX - centerX) * (180 / Math.PI);
                const rotationDiff = currentAngle - initialAngle;
                element.style.transform = `rotate(${currentRotation + rotationDiff}deg)`;
            } else { // Resizing mode
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
            }
        };

        document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
            // Update currentRotation after a rotation gesture ends
            currentRotation = getRotationDegrees(element);
        };
    };
}

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