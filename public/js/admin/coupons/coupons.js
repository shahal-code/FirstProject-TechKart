// --- Toggle Status ---
async function toggleCouponStatus(id) {
    try {
        const res = await fetch(`/admin/coupons/toggle/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) location.reload();
        else Swal.fire({ icon: 'error', title: 'Error', text: data.message, background: '#0f1420', color: '#fff' });
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong.', background: '#0f1420', color: '#fff' });
    }
}

// --- Delete ---
async function deleteCoupon(id) {
    const confirm = await Swal.fire({
        icon: 'warning', title: 'Delete Coupon?',
        text: 'This action cannot be undone.',
        showCancelButton: true, confirmButtonText: 'Yes, Delete',
        confirmButtonColor: '#ef4444', background: '#0f1420', color: '#fff'
    });
    if (!confirm.isConfirmed) return;
    try {
        const res = await fetch(`/admin/coupons/delete/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) location.reload();
        else Swal.fire({ icon: 'error', title: 'Error', text: data.message, background: '#0f1420', color: '#fff' });
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong.', background: '#0f1420', color: '#fff' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Live Search ---
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const val = this.value.toLowerCase();
            document.querySelectorAll('#couponsTableBody tr').forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(val) ? '' : 'none';
            });
        });
    }
});
