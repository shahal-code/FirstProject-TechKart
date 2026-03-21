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

// Admin Product Validation
const productForm = document.getElementById('productForm');
if (productForm) {
    productForm.addEventListener('submit', function(e) {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-text').forEach(el => el.classList.add('hidden'));
        
        // Validate Name
        const name = document.getElementById('productName').value.trim();
        if(!name || name.length < 3) {
            document.getElementById('nameError').textContent = 'Product name must be at least 3 characters.';
            document.getElementById('nameError').classList.remove('hidden');
            document.getElementById('nameError').classList.add('error-text');
            isValid = false;
        }
        
        // Validate Description
        const desc = document.getElementById('productDesc').value.trim();
        if(!desc || desc.length < 10) {
            document.getElementById('descError').textContent = 'Description must be at least 10 characters.';
            document.getElementById('descError').classList.remove('hidden');
            document.getElementById('descError').classList.add('error-text');
            isValid = false;
        }
        
        // Validate Price
        const price = document.getElementById('productPrice').value.trim();
        if(!price || isNaN(price) || Number(price) <= 0) {
            document.getElementById('priceError').textContent = 'Please enter a valid positive price.';
            document.getElementById('priceError').classList.remove('hidden');
            document.getElementById('priceError').classList.add('error-text');
            isValid = false;
        }
        
        // Validate Category
        const cat = document.getElementById('productCategory').value;
        if(!cat) {
            document.getElementById('categoryError').textContent = 'Please select a category.';
            document.getElementById('categoryError').classList.remove('hidden');
            document.getElementById('categoryError').classList.add('error-text');
            isValid = false;
        }

        // Validate Tech Specs
        const size = document.getElementById('productSize').value.trim();
        if(!size) {
            document.getElementById('sizeError').textContent = 'Please enter a size.';
            document.getElementById('sizeError').classList.remove('hidden');
            document.getElementById('sizeError').classList.add('error-text');
            isValid = false;
        }

        const ram = document.getElementById('productRam').value.trim();
        if(!ram) {
            document.getElementById('ramError').textContent = 'Please enter RAM details (or "N/A").';
            document.getElementById('ramError').classList.remove('hidden');
            document.getElementById('ramError').classList.add('error-text');
            isValid = false;
        }

        const processor = document.getElementById('productProcessor').value.trim();
        if(!processor) {
            document.getElementById('processorError').textContent = 'Please enter Processor details (or "N/A").';
            document.getElementById('processorError').classList.remove('hidden');
            document.getElementById('processorError').classList.add('error-text');
            isValid = false;
        }

        const storage = document.getElementById('productStorage').value.trim();
        if(!storage) {
            document.getElementById('storageError').textContent = 'Please enter storage details (or "N/A").';
            document.getElementById('storageError').classList.remove('hidden');
            document.getElementById('storageError').classList.add('error-text');
            isValid = false;
        }

        const gpu = document.getElementById('productGpu').value.trim();
        if(!gpu) {
            document.getElementById('gpuError').textContent = 'Please enter GPU details (or "N/A").';
            document.getElementById('gpuError').classList.remove('hidden');
            document.getElementById('gpuError').classList.add('error-text');
            isValid = false;
        }

        const totalImages = (typeof selectedFiles !== 'undefined' ? selectedFiles.length : 0) + (window.existingImageCount || 0);
        
        if (totalImages < 4) {
            Swal.fire({
                icon: 'error',
                title: 'Not enough images!',
                text: 'Product must have at least 4 images in total.',
                background: '#11151F',
                color: '#fff',
                confirmButtonColor: '#0055ff'
            });
            isValid = false;
        }

        if(!isValid) {
            e.preventDefault();
        }
    });
}
