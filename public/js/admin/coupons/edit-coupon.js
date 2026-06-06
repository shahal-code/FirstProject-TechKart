function updateValueLabel() {
    const type = document.getElementById('discountType').value;
    document.getElementById('valueLabel').textContent =
        type === 'percentage' ? 'Discount Value (%)' : 'Discount Value (\u20b9)';
}

function validateForm() {
    let valid = true;
    clearError('couponCode'); clearError('discountValue'); clearError('expirationDate');

    const code = document.getElementById('couponCode').value.trim();
    const discountValue = document.getElementById('discountValue').value;
    const expirationDate = document.getElementById('expirationDate').value;

    if (!code) { showError('couponCode', 'Coupon code is required.'); valid = false; }
    if (!discountValue || parseFloat(discountValue) <= 0) { showError('discountValue', 'Please enter a valid discount value.'); valid = false; }
    if (!expirationDate) { showError('expirationDate', 'Expiration date is required.'); valid = false; }

    return valid;
}

async function submitEdit() {
    if (!validateForm()) return;

    const code = document.getElementById('couponCode').value.trim().toUpperCase();
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value);
    const minPurchaseAmount = parseFloat(document.getElementById('minPurchaseAmount').value) || 0;
    const maxDiscountAmount = parseFloat(document.getElementById('maxDiscountAmount').value) || null;
    const expirationDate = document.getElementById('expirationDate').value;

    try {
        const urlMatch = window.location.pathname.match(/\/admin\/editCoupon\/(.+)$/);
        const couponId = urlMatch ? urlMatch[1] : '';
        const res = await fetch(`/admin/coupons/update/${couponId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, expirationDate })
        });
        const data = await res.json();
        if (data.success) {
            Swal.fire({ icon: 'success', title: 'Updated!', text: data.message, background: '#0f1420', color: '#fff', timer: 1500, showConfirmButton: false })
                .then(() => window.location.href = '/admin/coupons');
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.message, background: '#0f1420', color: '#fff' });
        }
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong.', background: '#0f1420', color: '#fff' });
    }
}
