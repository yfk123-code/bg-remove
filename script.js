const dropArea = document.getElementById('dropArea');
const imageInput = document.getElementById('imageInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const downloadBtn = document.getElementById('downloadBtn');
const loading = document.getElementById('loading');

// Drag & Drop Events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropArea.style.borderColor = '#ff6b6b';
    dropArea.style.background = '#fff5f5';
}

function unhighlight() {
    dropArea.style.borderColor = '#ddd';
    dropArea.style.background = 'white';
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
        processImage(files[0]);
    }
}

dropArea.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        processImage(e.target.files[0]);
    }
});

function processImage(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }

    showLoading(true);

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result.split(',')[1]; // Remove data URL prefix

        fetch('/.netlify/functions/remove-bg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Image })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const imageUrl = `data:image/png;base64,${data.image}`;
                previewImage.src = imageUrl;
                previewSection.style.display = 'block';
                downloadBtn.onclick = () => downloadImage(imageUrl, file.name.replace(/\.[^/.]+$/, "") + "_no_bg.png");
            } else {
                throw new Error(data.error || 'Unknown error');
            }
            showLoading(false);
        })
        .catch(err => {
            console.error(err);
            alert('Error processing image. Please try again.');
            showLoading(false);
        });
    };
    reader.readAsDataURL(file);
}

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    dropArea.style.display = show ? 'none' : 'flex';
}

function downloadImage(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
