document.getElementById("background_update").addEventListener("change", function(event) {
    const files = event.target.files;
    if (files.length > 0) {
        const picturesContainer = document.querySelector(".pictures");

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.className = "picture_upload";
                
                img.addEventListener("click", function() {
                    setCanvasBackground(img);
                });

                picturesContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
});

function setCanvasBackground(img) {
    const backgroundCanvas = document.getElementById("background_picture");
    const ctx = backgroundCanvas.getContext("2d");

    if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) return;

    backgroundCanvas.width = videoElement.videoWidth;
    backgroundCanvas.height = videoElement.videoHeight;

    const imgRatio = img.width / img.height;
    const canvasRatio = backgroundCanvas.width / backgroundCanvas.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
        drawHeight = backgroundCanvas.height;
        drawWidth = img.width * (backgroundCanvas.height / img.height);
        offsetX = (backgroundCanvas.width - drawWidth) / 2;
        offsetY = 0;
    } else {
        drawWidth = backgroundCanvas.width;
        drawHeight = img.height * (backgroundCanvas.width / img.width);
        offsetX = 0;
        offsetY = (backgroundCanvas.height - drawHeight) / 2;
    }

    ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}
