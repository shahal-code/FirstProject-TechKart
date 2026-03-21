let selectedFiles = [];

function previewImages(event) {
    const container = document.getElementById('imagePreviewContainer');
    const fileInput = event.target;
    const newFiles = Array.from(fileInput.files);
    selectedFiles = selectedFiles.concat(newFiles);
    syncFileInput(fileInput);
    renderPreviews(container);
}

function removeImage(index) {
    const container = document.getElementById('imagePreviewContainer');
    const fileInput = document.getElementById('imageUpload');
    selectedFiles.splice(index, 1);
    syncFileInput(fileInput);
    renderPreviews(container);
}

function syncFileInput(fileInput) {
    const dt = new DataTransfer();
    selectedFiles.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
}

function renderPreviews(container) {
    container.innerHTML = '<p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest text-center px-4 py-2">New Selection Preview</p>';
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'bg-[#151923] rounded-2xl p-4 flex items-center justify-between gap-4 mb-2 w-full border border-white/5';
            div.innerHTML = `
                <div class="flex items-center gap-4 overflow-hidden">
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src="${e.target.result}" class="w-full h-full object-cover" />
                    </div>
                    <div class="overflow-hidden">
                        <p class="font-bold text-[11px] text-white truncate max-w-[100px]">${file.name}</p>
                    </div>
                </div>
                <button type="button" onclick="removeImage(${index})" class="text-rose-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-rose-500/10 transition-colors">
                    <span class="material-symbols-outlined text-lg">close</span>
                </button>
            `;
            container.appendChild(div);
        }
        reader.readAsDataURL(file);
    });
}
