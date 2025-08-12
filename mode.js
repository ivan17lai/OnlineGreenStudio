const modeToggleButton = document.getElementById('modeToggleButton');

const addButton = document.getElementById('addButton');
const addForegroundButton = document.getElementById('addForegroundButton');
const addStickerButton = document.getElementById('addStickerButton');

let isSettingsMode = true; // Default to settings mode

function updateModeVisibility() {
    if (isSettingsMode) {
        addButton.style.display = 'flex';
        addForegroundButton.style.display = 'flex';
        addStickerButton.style.display = 'flex';
        stickerImageStrip.classList.remove('disabled-thumbnail-clicks');
    } else {
        addButton.style.display = 'none';
        addForegroundButton.style.display = 'none';
        addStickerButton.style.display = 'none';
        stickerImageStrip.classList.add('disabled-thumbnail-clicks');
    }
}

modeToggleButton.addEventListener('click', () => {
    isSettingsMode = !isSettingsMode;
    updateModeVisibility();
    // Optionally change button icon/text based on mode
    modeToggleButton.querySelector('.material-icons').textContent = isSettingsMode ? 'videocam' : 'settings';
});

// Initial call to set correct visibility on load
updateModeVisibility();
