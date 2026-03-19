window.confirmBlock = function(userId, isBlocked) {
    const action = isBlocked === 'true' ? 'Unblock' : 'Block';
    const color = isBlocked === 'true' ? '#10b981' : '#f43f5e';

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: `<span class="text-white">${action} User?</span>`,
            text: `Are you sure you want to ${action.toLowerCase()} this customer?`,
            icon: 'warning',
            background: '#111827',
            color: '#fff',
            showCancelButton: true,
            confirmButtonColor: color,
            cancelButtonColor: '#374151',
            confirmButtonText: `Yes, ${action}!`,
            customClass: {
                popup: 'glass-morphism rounded-3xl',
                confirmButton: 'rounded-xl font-bold uppercase tracking-widest text-[10px] px-6 py-3',
                cancelButton: 'rounded-xl font-bold uppercase tracking-widest text-[10px] px-6 py-3'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/admin/users/${userId}/block`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    if (response.ok) {
                        window.location.reload();
                    }
                });
            }
        });
    }
};
