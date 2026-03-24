let selectedFiles = [];
let cropper = null;
let currentFilesToProcess = [];

function openAddVariantModal() {
    document.getElementById('variantModal').classList.remove('hidden');
    document.getElementById('variantModal').classList.add('flex');
}

function closeModal() {
    document.getElementById('variantModal').classList.add('hidden');
    document.getElementById('variantModal').classList.remove('flex');
    selectedFiles = [];
    renderPreviews();
}

function previewVariantImages(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    currentFilesToProcess = files;
    event.target.value = ''; // Reset
    processNextFile();
}

function processNextFile() {
    if (currentFilesToProcess.length === 0) return;

    const file = currentFilesToProcess.shift();
    const reader = new FileReader();
    reader.onload = (e) => {
        const modal = document.getElementById('cropperModal');
        const image = document.getElementById('cropperImage');
        image.src = e.target.result;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        if (cropper) cropper.destroy();
        cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 1
        });
    };
    reader.readAsDataURL(file);
}

function closeCropper() {
    document.getElementById('cropperModal').classList.add('hidden');
    if (cropper) cropper.destroy();
    if (currentFilesToProcess.length > 0) processNextFile();
}

function cropImage() {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({ width: 800, height: 800 });
    canvas.toBlob((blob) => {
        const file = new File([blob], `variant-${Date.now()}.jpg`, { type: 'image/jpeg' });
        selectedFiles.push(file);
        syncFileInput();
        renderPreviews();
        closeCropper();
    }, 'image/jpeg', 0.9);
}

function syncFileInput() {
    const input = document.getElementById('variantImageUpload');
    const dt = new DataTransfer();
    selectedFiles.forEach(f => dt.items.add(f));
    input.files = dt.files;
}

function renderPreviews() {
    const container = document.getElementById('variantImagePreview');
    container.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        const div = document.createElement('div');
        div.className = 'w-24 h-24 rounded-xl border border-white/10 relative overflow-hidden group';
        div.innerHTML = `
            <img src="${url}" class="w-full h-full object-cover">
            <button type="button" onclick="removeImage(${index})" class="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="material-symbols-outlined text-xs">close</span>
            </button>
        `;
        container.appendChild(div);
    });
}

function removeImage(index) {
    selectedFiles.splice(index, 1);
    syncFileInput();
    renderPreviews();
}

async function deleteVariant(variantId) {
    const res = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#fe3f40',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (res.isConfirmed) {
        try {
            const productId = window.location.pathname.split('/').pop();
            const response = await fetch(`/admin/product/${productId}/variants/delete/${variantId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                Swal.fire('Deleted!', 'Variant has been removed.', 'success').then(() => {
                    window.location.reload();
                });
            }
        } catch (error) {
            Swal.fire('Error!', 'Failed to delete variant.', 'error');
        }
    }
}
