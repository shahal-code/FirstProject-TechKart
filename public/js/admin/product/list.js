function confirmDelete(id) {
    Swal.fire({
        title: 'Are you want to delete ?',
        background: '#11151F',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#f43f5e',
        cancelButtonColor: '#10b981',
        confirmButtonText: 'Delete Product',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
             fetch('/admin/product/delete/' + id, {method: 'DELETE'})
             .then(() => window.location.reload());
        }
    });
}

function toggleProductStatus(id) {
    fetch('/admin/product/toggle-status/' + id, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated',
                    text: data.message,
                    background: '#11151F',
                    color: '#fff',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => window.location.reload());
            }
        })
        .catch(err => console.error('Error:', err));
}
