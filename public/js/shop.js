document.addEventListener('DOMContentLoaded', function () {
    const sortSelect = document.getElementById('sortSelect');
    // const categoryCheckboxes = document.querySelectorAll('input[name="category"]'); // No longer needed
    // const processorCheckboxes = document.querySelectorAll('input[name="processor"]'); // No longer needed

    // Helper to get all checked values for a name
    function getCheckedValues(name) {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
    }

    window.toggleProcessorGroup = function (id) {
        const sub = document.getElementById(id);
        const icon = document.getElementById(id + '-icon');
        if (!sub || !icon) return;

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

        // 2. Multi-select filters
        ['category', 'processor', 'ram'].forEach(filterName => {
            searchParams.delete(filterName); // Clear existing
            const values = getCheckedValues(filterName);
            values.forEach(val => searchParams.append(filterName, val));
        });

        // 3. Get Selected Price
        const checkedPrice = document.querySelector('input[name="price"]:checked');
        if (checkedPrice) {
            searchParams.set('price', checkedPrice.value);
        } else {
            searchParams.delete('price');
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

    // Attach to all relevante inputs
    document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
        if (input.name !== 'search') { // Don't trigger on search input change
            input.addEventListener('change', updateFilters);
        }
    });

    // Fix for the "Apply All Filters" button if it exists
    const applyButton = document.querySelector('button.bg-primary');
    if (applyButton && applyButton.textContent.trim().toLowerCase().includes('apply all')) {
        applyButton.addEventListener('click', (e) => {
            e.preventDefault();
            updateFilters();
        });
    }
});
