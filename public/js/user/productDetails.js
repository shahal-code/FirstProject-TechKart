const variants = JSON.parse(document.getElementById('product-variants-json').textContent);
let selectedFilters = {
    ram: variants[0]?.ram,
    storage: variants[0]?.storage,
    size: variants[0]?.size,
    color: variants[0]?.color
};
let currentQty = 1;

function updateSelection(type, value) {
    selectedFilters[type] = value;

    // Find the best matching variant
    const variant = variants.find(v =>
        (!selectedFilters.ram || v.ram === selectedFilters.ram) &&
        (!selectedFilters.storage || v.storage === selectedFilters.storage) &&
        (!selectedFilters.size || v.size === selectedFilters.size) &&
        (!selectedFilters.color || v.color === selectedFilters.color)
    ) || variants.find(v => v[type] === value); // Fallback if exact combo not found

    if (variant) {
        updateUI(variant);
    }

    // Update button styles
    document.querySelectorAll(`.option-btn[data-type="${type}"]`).forEach(btn => {
        if (btn.getAttribute('data-value') === value) {
            btn.classList.add('border-[#3b82f6]', 'bg-[#3b82f6]/10', 'text-white');
            btn.classList.remove('border-white/10', 'text-slate-500');
        } else {
            btn.classList.remove('border-[#3b82f6]', 'bg-[#3b82f6]/10', 'text-white');
            btn.classList.add('border-white/10', 'text-slate-500');
        }
    });
}

function updateUI(variant) {
    // Price
    const priceEl = document.getElementById('displayPrice');
    const oldPriceEl = document.getElementById('displayOldPrice');
    const discountBadge = document.getElementById('discount-badge');

    if (priceEl) priceEl.textContent = `₹${variant.price}`;

    if (variant.oldPrice) {
        if (oldPriceEl) {
            oldPriceEl.textContent = `₹${variant.oldPrice}`;
            oldPriceEl.classList.remove('hidden');
        }
        if (discountBadge) {
            const percent = Math.round(((variant.oldPrice - variant.price) / variant.oldPrice) * 100);
            discountBadge.textContent = `Save ${percent}%`;
            discountBadge.classList.remove('hidden');
        }
    } else {
        if (oldPriceEl) oldPriceEl.classList.add('hidden');
        if (discountBadge) discountBadge.classList.add('hidden');
    }

    // Stock
    const stockDot = document.getElementById('stock-dot');
    const stockStatus = document.getElementById('stock-status');

    if (stockDot && stockStatus) {
        if (variant.stock > 10) {
            stockDot.className = 'w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse';
            stockStatus.textContent = 'In Stock';
            stockStatus.className = 'text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500';
        } else if (variant.stock > 0) {
            stockDot.className = 'w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse';
            stockStatus.textContent = `Only ${variant.stock} Left`;
            stockStatus.className = 'text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500';
        } else {
            stockDot.className = 'w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse';
            stockStatus.textContent = 'Out of Stock';
            stockStatus.className = 'text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500';
        }
    }

    // Meta Badges (below price)
    const gpuMeta = document.getElementById('badge-gpu-meta');
    const ramMeta = document.getElementById('badge-ram-meta');
    const storageMeta = document.getElementById('badge-storage-meta');

    if (gpuMeta) gpuMeta.textContent = variant.gpu;
    if (ramMeta) ramMeta.textContent = variant.ram;
    if (storageMeta) storageMeta.textContent = variant.storage;

    // Spec Cards
    const specProc = document.getElementById('spec-processor');
    const specGpu = document.getElementById('spec-gpu');
    if (specProc) specProc.textContent = variant.processor;
    if (specGpu) specGpu.textContent = variant.gpu;

    // Gallery
    if (variant.images && variant.images.length > 0) {
        const mainImg = document.getElementById('mainImage');
        if (mainImg) mainImg.src = variant.images[0];

        const thumbGrid = document.querySelector('.grid.grid-cols-4.gap-4');
        if (thumbGrid) {
            thumbGrid.innerHTML = '';
            variant.images.forEach((img, i) => {
                const div = document.createElement('div');
                div.className = `glass-card aspect-square rounded-2xl overflow-hidden cursor-pointer hover:border-primary transition-all duration-300 thumbnails border-2 ${i === 0 ? 'border-primary' : 'border-transparent'}`;
                div.onclick = () => changeImage(img, div);
                div.innerHTML = `<img src="${img}" class="w-full h-full object-cover">`;
                thumbGrid.appendChild(div);
            });
        }
    }
}

function updateQty(delta) {
    currentQty = Math.max(1, currentQty + delta);
    document.getElementById('quantity').textContent = currentQty;
}

function changeImage(src, thumb) {
    document.getElementById('mainImage').src = src;
    document.querySelectorAll('.thumbnails').forEach(t => {
        t.classList.remove('border-primary');
        t.classList.add('border-transparent');
    });
    thumb.classList.add('border-primary');
    thumb.classList.remove('border-transparent');
}

// Modern Image Zoom Logic
function setupZoom() {
    const container = document.getElementById('mainImageContainer');
    const img = document.getElementById('mainImage');

    if (!container || !img) return;

    container.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = container.getBoundingClientRect();
        const x = ((e.pageX - left - window.pageXOffset) / width) * 100;
        const y = ((e.pageY - top - window.pageYOffset) / height) * 100;

        img.style.transformOrigin = `${x}% ${y}%`;
    });

    container.addEventListener('mouseleave', () => {
        img.style.transformOrigin = 'center center';
    });
}

// Initialize after window loads
window.addEventListener('load', setupZoom);

// Add to Cart Logic
async function handleAddToCart(productId) {
    const variant = variants.find(v =>
        (!selectedFilters.ram || v.ram === selectedFilters.ram) &&
        (!selectedFilters.storage || v.storage === selectedFilters.storage) &&
        (!selectedFilters.size || v.size === selectedFilters.size) &&
        (!selectedFilters.color || v.color === selectedFilters.color)
    ) || variants[0];

    if (!variant) {
        Swal.fire({
            icon: 'info',
            title: 'Selection Required',
            text: 'Please select product options before adding to cart.',
            background: '#0D0D0D',
            color: '#fff'
        });
        return;
    }
    
    // Call the global function from cartUtils.js
    if (typeof addToCart === 'function') {
        await addToCart(productId, variant._id, currentQty);
    } else {
        console.error("Global addToCart function not found!");
    }
}
