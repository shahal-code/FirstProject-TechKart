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
