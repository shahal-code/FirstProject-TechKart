document.addEventListener('DOMContentLoaded', function () {
    const sortSelect = document.getElementById('sortSelect');
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    const processorCheckboxes = document.querySelectorAll('input[name="processor"]');

    window.toggleProcessorGroup = function(id) {
        const sub = document.getElementById(id);
        const icon = document.getElementById(id + '-icon');
        const isHidden = sub.classList.contains('hidden');
        
        // Toggle the sub-menu
        sub.classList.toggle('hidden');
        
        // Rotate the icon
        if (isHidden) {
            icon.classList.add('rotate-180');
        } else {
            icon.classList.remove('rotate-180');
        }
    };

    function updateFilters() {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        // 1. Get Sort Value
        if (sortSelect) {
            searchParams.set('sort', sortSelect.value);
        }

        // 2. Get Selected Category
        const checkedCategory = Array.from(categoryCheckboxes).find(cb => cb.checked);
        if (checkedCategory) {
            searchParams.set('category', checkedCategory.value);
        } else {
            searchParams.delete('category');
        }

        // 3. Get Selected Processor
        const checkedProcessor = Array.from(processorCheckboxes).find(cb => cb.checked);
        if (checkedProcessor) {
            searchParams.set('processor', checkedProcessor.value);
        } else {
            searchParams.delete('processor');
        }

        // 4. Get Selected Price
        const checkedPrice = document.querySelector('input[name="price"]:checked');
        if (checkedPrice) {
            searchParams.set('price', checkedPrice.value);
        }

        // Reset to page 1 on every filter change
        searchParams.set('page', 1);

        // Update URL and refresh
        window.location.search = searchParams.toString();
    }

    // Event Listeners
    if (sortSelect) {
        sortSelect.addEventListener('change', updateFilters);
    }

    categoryCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateFilters);
    });

    processorCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateFilters);
    });

    document.querySelectorAll('input[name="price"]').forEach(radio => {
        radio.addEventListener('change', updateFilters);
    });
});
