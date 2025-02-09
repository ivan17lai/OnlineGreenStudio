const videoElement = document.getElementById('videoElement');
        const outputCanvas = document.getElementById('outputCanvas');
        const background_picture = document.getElementById('background_picture');
        const outputCtx = outputCanvas.getContext('2d');

        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            videoElement.srcObject = stream;
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                outputCanvas.width = videoElement.videoWidth;
                outputCanvas.height = videoElement.videoHeight;
                background_picture.width = videoElement.videoWidth;
                background_picture.height = videoElement.videoHeight;
            };
        });

        const selfieSegmentation = new SelfieSegmentation({ locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
        }});

        selfieSegmentation.setOptions({ modelSelection: 1 });
        selfieSegmentation.onResults(onResults);

        async function processFrame() {
            await selfieSegmentation.send({ image: videoElement });
            requestAnimationFrame(processFrame);
        }

        function onResults(results) {
           
let tempCanvas = document.createElement("canvas");
let tempCtx = tempCanvas.getContext("2d");
tempCanvas.width = outputCanvas.width;
tempCanvas.height = outputCanvas.height;

tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
tempCtx.drawImage(results.image, 0, 0, tempCanvas.width, tempCanvas.height);

tempCtx.globalCompositeOperation = 'destination-in';
tempCtx.drawImage(results.segmentationMask, 0, 0, tempCanvas.width, tempCanvas.height);
tempCtx.globalCompositeOperation = 'source-over';


outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
outputCtx.drawImage(background_picture, 0, 0, outputCanvas.width, outputCanvas.height);

outputCtx.drawImage(tempCanvas, 0, 0);

        }

        videoElement.onplay = processFrame;