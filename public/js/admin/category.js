const modal = document.getElementById('addCategoryModal');

function openAddCategoryModal() {
    modal.classList.remove('hidden');
    setTimeout(() => { 
        modal.classList.remove('opacity-0'); 
        modal.children[0].classList.remove('scale-95'); 
    }, 10);
}

function closeModal() {
    modal.classList.add('opacity-0'); 
    modal.children[0].classList.add('scale-95');
    setTimeout(() => { 
        modal.classList.add('hidden'); 
    }, 300);
}

// Function to handle Edit Category Modal (placeholder for now as requested step-by-step)
function editCategory(id, name, description, icon) {
    console.log("Edit Category:", id, name, description, icon);
    // Logic will be added in next steps
}

// Function to toggle List/Unlist (placeholder)
function toggleList(id, isListed) {
    console.log("Toggle List:", id, isListed);
    // Logic will be added in next steps
}
