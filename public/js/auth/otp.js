// Store hidden OTP value for submission form logic
window.submitOtp = function () {
    const inputs = document.querySelectorAll('input[type="number"]');
    let otp = '';
    inputs.forEach(input => {
        otp += input.value;
    });
    const otpValueInput = document.getElementById('otpValue');
    if (otpValueInput) {
        otpValueInput.value = otp;
    }
};

// Auto move cursor logic
window.moveToNext = function (currentInput, e) {
    // Backspace handling
    if (e.inputType === "deleteContentBackward") {
        if (currentInput.previousElementSibling) {
            currentInput.previousElementSibling.focus();
        }
        return;
    }

    // Move to next handling
    if (currentInput.value.length > 1) {
        currentInput.value = currentInput.value.slice(0, 1);
    }
    if (currentInput.value.length === 1 && currentInput.nextElementSibling) {
        currentInput.nextElementSibling.focus();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Listen to explicit keydown for backspace when input is already empty
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && this.value === '') {
                if (this.previousElementSibling) {
                    this.previousElementSibling.focus();
                }
            }
        });
    });

    // OTP Timer logic
    const timerElement = document.getElementById('timer');
    const resendBtn = document.getElementById('resendBtn');
    const timerText = document.getElementById('timerText');
    let count = timerText ? parseInt(timerText.getAttribute('data-expires-in')) : 15;

    if (timerElement && resendBtn && timerText) {
        // Initial set to avoid delay
        let initialSeconds = count < 10 ? '0' + count : count;
        timerElement.innerHTML = `00:${initialSeconds}`;
        
        if (count <= 0) {
            timerElement.innerHTML = "00:00";
            resendBtn.disabled = false;
            resendBtn.classList.remove('cursor-not-allowed', 'opacity-50');
            timerText.style.display = 'none';
            return;
        }

        const countdown = setInterval(() => {
            if (count <= 0) {
                clearInterval(countdown);
                timerElement.innerHTML = "00:00";
                resendBtn.disabled = false;
                resendBtn.classList.remove('cursor-not-allowed', 'opacity-50');
                timerText.style.display = 'none';
            } else {
                let seconds = count < 10 ? '0' + count : count;
                timerElement.innerHTML = `00:${seconds}`;
                count--;
            }
        }, 1000);
    }
});

window.resendOtp = function () {
    const resendBtn = document.getElementById('resendBtn');
    const resendUrlInput = document.getElementById('resendUrl');
    const timerText = document.getElementById('timerText');
    const timerElement = document.getElementById('timer');

    if (resendBtn && !resendBtn.disabled && resendUrlInput) {
        const resendUrl = resendUrlInput.value;
        fetch(resendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            resendBtn.disabled = true;
            resendBtn.classList.add('cursor-not-allowed', 'opacity-50');
            if (timerText) timerText.style.display = 'inline';
            if (timerElement) timerElement.innerHTML = `00:59`;
            window.location.reload();
        });
    }
};
