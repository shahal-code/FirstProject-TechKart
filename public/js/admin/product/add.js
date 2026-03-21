let selectedFiles = [];

function previewImages(event) {
    const container = document.getElementById('imagePreviewContainer');
    const fileInput = event.target;
    const newFiles = Array.from(fileInput.files);
    
    // Add new files to our running list
    selectedFiles = selectedFiles.concat(newFiles);
    
    // Sync the input element with our complete running list
    syncFileInput(fileInput);
    
    // Re-render the visual preview
    renderPreviews(container);
}

function removeImage(index) {
    const container = document.getElementById('imagePreviewContainer');
    const fileInput = document.getElementById('imageUpload');
    
    // Remove the file from our running list
    selectedFiles.splice(index, 1);
    
    // Sync the input element
    syncFileInput(fileInput);
    
    // Re-render
    renderPreviews(container);
}

function syncFileInput(fileInput) {
    const dt = new DataTransfer();
    selectedFiles.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
}

function renderPreviews(container) {
    container.innerHTML = '';
    
    if (selectedFiles.length === 0) {
        container.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <span class="material-symbols-outlined text-slate-500">image_not_supported</span>
                </div>
                <div>
                    <p class="font-bold text-sm text-slate-300">Preview Mode</p>
                    <p class="text-xs text-slate-500">No file selected</p>
                </div>
            </div>
        `;
        return;
    }

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'bg-input-bg rounded-2xl p-4 flex items-center justify-between gap-4 mb-2 w-full';
            div.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src="${e.target.result}" class="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p class="font-bold text-sm text-white truncate max-w-[150px]">${file.name}</p>
                        <p class="text-xs text-slate-500">${(file.size / 1024 / 1024).toFixed(1)}MB</p>
                    </div>
                </div>
                <button type="button" onclick="removeImage(${index})" class="text-rose-500 hover:text-rose-400 p-2 rounded-full hover:bg-rose-500/10 transition-colors">
                    <span class="material-symbols-outlined text-xl">close</span>
                </button>
            `;
            container.appendChild(div);
        }
        reader.readAsDataURL(file);
    });
}
