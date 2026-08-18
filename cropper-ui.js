// cropper-ui.js

let cropper;
let cropperModal;
let cropperImage;
let btnCancelCrop;
let btnApplyCrop;
let photoInput;

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function() {
    
    // Inject the Modal HTML directly via JS so we don't clutter the HTML file too much
    const modalHTML = `
        <div class="image-crop-modal" id="cropperModal">
            <div class="image-crop-container-wrapper">
                <div class="image-crop-modal-title">Crop Your Photo</div>
                <div class="img-container">
                    <img id="cropperImage" src="">
                </div>
                <div class="cropper-actions">
                    <button type="button" class="btn-cancel-crop" id="btnCancelCrop">Cancel</button>
                    <button type="button" class="btn-apply-crop" id="btnApplyCrop">Apply Crop</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Elements
    cropperModal = document.getElementById('cropperModal');
    cropperImage = document.getElementById('cropperImage');
    btnCancelCrop = document.getElementById('btnCancelCrop');
    btnApplyCrop = document.getElementById('btnApplyCrop');
    photoInput = document.getElementById('playerPhoto');
    
    // Listen for file selection
    photoInput.addEventListener('change', function(e) {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            
            // Mobile Android cameras sometimes return empty mime types, so we don't strictly block if it's empty, 
            // but we do block obvious non-images if the mime type is present.
            if (file.type && !file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                // IMPORTANT: Wait for the image to actually decode and render in the DOM
                // before initializing Cropper.js, otherwise slower mobile devices will 
                // render a 0x0 blank canvas!
                cropperImage.onload = function() {
                    openCropper();
                    // Clear the onload so it doesn't accidentally fire again
                    cropperImage.onload = null;
                };
                cropperImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    btnCancelCrop.addEventListener('click', closeCropperAndClear);
    btnApplyCrop.addEventListener('click', applyCrop);
});

function openCropper() {
    cropperModal.style.display = 'flex';
    
    // Initialize Cropper.js
    cropper = new Cropper(cropperImage, {
        aspectRatio: 1, // Force a perfect square
        viewMode: 1,    // Restrict the crop box to not exceed the size of the canvas
        dragMode: 'move', // Allow moving the image within the cropper
        autoCropArea: 1,  // Start with the maximum possible square
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
    });
}

function closeCropperAndClear() {
    cropperModal.style.display = 'none';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    // Clear the input so the user can re-select the same file if needed
    photoInput.value = ""; 
    window.croppedPhotoBlob = null;
    
    // Also clear the summary photo
    document.getElementById("summaryPhoto").src = "";
}

function applyCrop() {
    if (!cropper) return;
    
    // Extract the cropped image data
    // We output an 600x600 canvas to ensure high quality but reasonable file size
    const canvas = cropper.getCroppedCanvas({
        width: 600,
        height: 600,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });
    
    // Convert to Blob
    canvas.toBlob(function(blob) {
        // Save globally so script.js can pick it up
        window.croppedPhotoBlob = blob;
        
        // Update the summary picture for instant preview
        document.getElementById("summaryPhoto").src = URL.createObjectURL(blob);
        
        // Close modal
        cropperModal.style.display = 'none';
        cropper.destroy();
        cropper = null;
        
    }, 'image/jpeg', 0.9);
}
