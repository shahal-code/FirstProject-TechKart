// ─── Shared Validators ────────────────────────────────────────────────────────
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return null;
};

const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    return null;
};

const validateFullname = (fullname) => {
    if (!fullname) return "Full name is required";
    if (fullname.trim().length < 3) return "Name must be at least 3 characters long";
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullname)) return "Name can only contain letters and spaces";
    return null;
};

const validateOtp = (otp) => {
    if (!otp) return "OTP is required";
    if (!/^\d{6}$/.test(otp)) return "OTP must be 6 digits";
    return null;
};

// ─── Admin Product Validation ─────────────────────────────────────────────────
const productForm = document.getElementById('productForm');
if (productForm) {
    productForm.addEventListener('submit', function (e) {
        let isValid = true;

        document.querySelectorAll('.error-text').forEach(el => el.classList.add('hidden'));

        const name = document.getElementById('productName').value.trim();
        if (!name || name.length < 3) {
            document.getElementById('nameError').textContent = 'Product name must be at least 3 characters.';
            document.getElementById('nameError').classList.remove('hidden');
            document.getElementById('nameError').classList.add('error-text');
            isValid = false;
        }

        const desc = document.getElementById('productDesc').value.trim();
        if (!desc || desc.length < 10) {
            document.getElementById('descError').textContent = 'Description must be at least 10 characters.';
            document.getElementById('descError').classList.remove('hidden');
            document.getElementById('descError').classList.add('error-text');
            isValid = false;
        }

        const price = document.getElementById('productPrice').value.trim();
        if (!price || isNaN(price) || Number(price) <= 0) {
            document.getElementById('priceError').textContent = 'Please enter a valid positive price.';
            document.getElementById('priceError').classList.remove('hidden');
            document.getElementById('priceError').classList.add('error-text');
            isValid = false;
        }

        const cat = document.getElementById('productCategory').value;
        if (!cat) {
            document.getElementById('categoryError').textContent = 'Please select a category.';
            document.getElementById('categoryError').classList.remove('hidden');
            document.getElementById('categoryError').classList.add('error-text');
            isValid = false;
        }

        if (!isValid) e.preventDefault();
    });
}


// ─── Add Category Form ────────────────────────────────────────────────────────
const addCategoryForm = document.getElementById('addCategoryForm');
if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        let isValid = true;

        document.querySelectorAll('.error-text').forEach(el => el.classList.add('hidden'));

        const name = document.getElementById('categoryName').value.trim();
        if (!name || name.length < 2) {
            document.getElementById('categoryNameError').textContent = 'Category name must be at least 2 characters.';
            document.getElementById('categoryNameError').classList.remove('hidden');
            document.getElementById('categoryNameError').classList.add('error-text');
            isValid = false;
        }

        const desc = document.getElementById('categoryDescription').value.trim();
        if (!desc || desc.length < 10) {
            document.getElementById('categoryDescError').textContent = 'Description must be at least 10 characters.';
            document.getElementById('categoryDescError').classList.remove('hidden');
            document.getElementById('categoryDescError').classList.add('error-text');
            isValid = false;
        }

        if (!isValid) return;

        try {
            const response = await fetch('/admin/addCategory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description: desc })
            });
            const data = await response.json();
            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Success!', text: data.message, background: '#111827', color: '#fff', showConfirmButton: false, timer: 1500 })
                    .then(() => { window.location.href = '/admin/category'; });
            } else {
                Swal.fire({ icon: 'error', title: 'Oops...', text: data.error || 'Something went wrong.', background: '#111827', color: '#fff' });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to communicate with the server.', background: '#111827', color: '#fff' });
        }
    });
}

// ─── Edit Category Form ───────────────────────────────────────────────────────
const editCategoryForm = document.getElementById('editCategoryForm');
if (editCategoryForm) {
    editCategoryForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        let isValid = true;

        document.querySelectorAll('.error-text').forEach(el => el.classList.add('hidden'));

        const name = document.getElementById('categoryName').value.trim();
        if (!name || name.length < 2) {
            document.getElementById('categoryNameError').textContent = 'Category name must be at least 2 characters.';
            document.getElementById('categoryNameError').classList.remove('hidden');
            document.getElementById('categoryNameError').classList.add('error-text');
            isValid = false;
        }

        const desc = document.getElementById('categoryDescription').value.trim();
        if (!desc || desc.length < 10) {
            document.getElementById('categoryDescError').textContent = 'Description must be at least 10 characters.';
            document.getElementById('categoryDescError').classList.remove('hidden');
            document.getElementById('categoryDescError').classList.add('error-text');
            isValid = false;
        }

        if (!isValid) return;

        const id = document.getElementById('categoryId').value;
        try {
            const response = await fetch(`/admin/editCategory/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description: desc })
            });
            const data = await response.json();
            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Updated!', text: data.message, background: '#111827', color: '#fff', showConfirmButton: false, timer: 1500 })
                    .then(() => { window.location.href = '/admin/category'; });
            } else {
                Swal.fire({ icon: 'error', title: 'Oops...', text: data.error || 'Something went wrong.', background: '#111827', color: '#fff' });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to communicate with the server.', background: '#111827', color: '#fff' });
        }
    });
}
