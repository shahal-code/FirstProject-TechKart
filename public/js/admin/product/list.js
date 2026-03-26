function confirmDelete(id) {
    Swal.fire({
        title: 'Delete Product?',
        text: "Are you sure you want to delete this product? This action cannot be undone.",
        background: '#11151F',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#f43f5e',
        cancelButtonColor: '#10b981',
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
             fetch('/admin/product/delete/' + id, {method: 'DELETE'})
             .then(() => window.location.reload());
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toggle-block-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const isBlocked = btn.getAttribute('data-blocked') === 'true';
            
            Swal.fire({
                title: isBlocked ? 'Unblock Product?' : 'Block Product?',
                text: `Are you sure you want to ${isBlocked ? 'unblock' : 'block'} "${name}"?`,
                background: '#11151F',
                color: '#fff',
                showCancelButton: true,
                confirmButtonColor: isBlocked ? '#10b981' : '#f59e0b',
                cancelButtonColor: '#334155',
                confirmButtonText: isBlocked ? 'Yes, Unblock' : 'Yes, Block',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = `/admin/product/toggle-block/${id}`;
                }
            });
        });
    });
});
