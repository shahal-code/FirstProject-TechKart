document.addEventListener('DOMContentLoaded', function () {
    const sortSelect = document.getElementById('sortSelect');
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');

    function updateFilters() {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        // 1. Get Sort Value
        if (sortSelect) {
            searchParams.set('sort', sortSelect.value);
        }

        // 2. Get Selected Category
        // For simplicity, we are handling one category at a time in this step
        const checkedCategory = Array.from(categoryCheckboxes).find(cb => cb.checked);
        if (checkedCategory) {
            searchParams.set('category', checkedCategory.value);
        } else {
            searchParams.delete('category');
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
});
