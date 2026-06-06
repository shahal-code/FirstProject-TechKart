async function updateItemStatus(orderId, itemId, currentStatus) {
    const { value: status } = await Swal.fire({
        title: 'Update Item Status',
        input: 'select',
        inputOptions: {
            'Pending': 'Pending',
            'Shipped': 'Shipped',
            'Out for Delivery': 'Out for Delivery',
            'Delivered': 'Delivered',
            'Cancelled': 'Cancelled',
            'Returned': 'Returned'
        },
        inputValue: currentStatus,
        showCancelButton: true,
        background: '#0d0d0d',
        color: '#fff',
        confirmButtonColor: '#0055ff',
        customClass: {
            input: 'swal-custom-select'
        }
    });

    if (status && status !== currentStatus) {
        try {
            const response = await fetch('/admin/orders/update-item-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, itemId, status })
            });
            const data = await response.json();
            if (data.success) {
                await Swal.fire({ icon: 'success', title: 'Updated', text: data.message, background: '#0d0d0d', color: '#fff' });
                window.location.reload();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#0d0d0d', color: '#fff' });
        }
    }
}

function downloadInvoice(orderId) {
    Swal.fire({
        title: 'Generating Invoice...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });
    window.location.href = `/admin/orders/${orderId}/invoice`;
    setTimeout(() => Swal.close(), 2000);
}
