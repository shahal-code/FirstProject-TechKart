document.addEventListener('DOMContentLoaded', () => {
    const addressForm = document.getElementById('addressForm');
    if (!addressForm) return;

    const fields = {
        fullname: {
            validate: (val) => {
                if (!val || val.trim() === "") return "Full name is required";
                if (val.trim().length < 3) return "Name must be at least 3 characters long";
                const nameRegex = /^[a-zA-Z\s]+$/;
                if (!nameRegex.test(val)) return "Name can only contain letters and spaces";
                return null;
            }
        },
        phone: {
            validate: (val) => {
                if (!val || val.trim() === "") return "Phone number is required";
                if (!/^[6-9]\d{9}$/.test(val)) return "Please enter a valid 10-digit Indian phone number";
                return null;
            }
        },
        email: {
            validate: (val) => {
                if (!val || val.trim() === "") return "Email is required";
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) return "Invalid email format";
                return null;
            }
        },
        line1: {
            validate: (val) => (!val || val.trim() === "") ? "Address Line 1 is required" : null
        },
        city: {
            validate: (val) => (!val || val.trim() === "") ? "City is required" : null
        },
        state: {
            validate: (val) => (!val || val.trim() === "") ? "State is required" : null
        },
        postal_code: {
            validate: (val) => {
                if (!val || val.trim() === "") return "Postal code is required";
                if (!/^\d{6}$/.test(val)) return "Enter a valid 6-digit postal code";
                return null;
            }
        },
        address_type: {
            validate: (val) => (!val || val === "") ? "Please select an address type" : null
        }
    };

    const showError = (input, message) => {
        const container = input.closest('.relative') || input.parentElement;
        let errorDisplay = container.querySelector('.error-message');
        
        if (!errorDisplay) {
            errorDisplay = document.createElement('div');
            errorDisplay.className = 'error-message text-red-500 text-[10px] mt-1 ml-4 font-medium transition-all duration-300 opacity-0 transform -translate-y-2';
            container.appendChild(errorDisplay);
        }

        if (message) {
            errorDisplay.textContent = message;
            errorDisplay.classList.remove('opacity-0', '-translate-y-2');
            errorDisplay.classList.add('opacity-100', 'translate-y-0');
            input.classList.add('!border-red-500/50', 'ring-1', 'ring-red-500/20');
            input.classList.remove('focus:border-primary');
        } else {
            errorDisplay.classList.add('opacity-0', '-translate-y-2');
            errorDisplay.classList.remove('opacity-100', 'translate-y-0');
            input.classList.remove('!border-red-500/50', 'ring-1', 'ring-red-500/20');
            input.classList.add('focus:border-primary');
            setTimeout(() => {
                if (errorDisplay.classList.contains('opacity-0')) {
                    errorDisplay.textContent = '';
                }
            }, 300);
        }
    };

    const validateField = (name) => {
        const input = addressForm.querySelector(`[name="${name}"]`);
        if (!input) return true;
        
        const error = fields[name].validate(input.value);
        showError(input, error);
        return !error;
    };

    // Add input listeners for real-time validation
    Object.keys(fields).forEach(name => {
        const input = addressForm.querySelector(`[name="${name}"]`);
        if (input) {
            input.addEventListener('input', () => validateField(name));
            input.addEventListener('blur', () => validateField(name));
            
            // For select elements
            if (input.tagName === 'SELECT') {
                input.addEventListener('change', () => validateField(name));
            }
        }
    });

    addressForm.addEventListener('submit', (e) => {
        let isValid = true;
        Object.keys(fields).forEach(name => {
            if (!validateField(name)) {
                isValid = false;
            }
        });

        if (!isValid) {
            e.preventDefault();
            // Scroll to the first error
            const firstError = document.querySelector('.error-message.opacity-100');
            if (firstError) {
                firstError.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
});
