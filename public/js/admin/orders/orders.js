async function updateStatus(orderId, currentStatus) {
    const { value: newStatus } = await Swal.fire({
        title: 'Update Order Status',
        input: 'select',
        inputOptions: {
            'Pending': 'Pending',
            'Shipped': 'Shipped',
            'Out for Delivery': 'Out for Delivery',
            'Delivered': 'Delivered',
            'Cancelled': 'Cancelled',
            'Return Request': 'Return Request',
            'Returned': 'Returned'
        },
        inputValue: currentStatus,
        showCancelButton: true,
        confirmButtonColor: '#0055ff',
        cancelButtonColor: 'rgba(255,255,255,0.05)',
        background: '#1a2234',
        color: '#fff',
        inputAttributes: {
            'style': 'color-scheme: dark;'
        },
        customClass: {
            popup: 'rounded-2xl border border-white/10 shadow-2xl',
            input: 'bg-slate-800 text-white border-white/10 rounded-lg focus:ring-primary'
        }
    });

    if (newStatus && newStatus !== currentStatus) {
        try {
            const response = await fetch('/admin/orders/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: data.message,
                    background: '#1a2234',
                    color: '#fff',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => window.location.reload());
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.message,
                background: '#1a2234',
                color: '#fff'
            });
        }
    }
}
