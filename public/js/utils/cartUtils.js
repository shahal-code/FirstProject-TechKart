async function addToCart(productId, variantId = null, quantity = 1) {
    try {
        // If variantId is not provided, we might need to fetch the default one
        // or the server can handle it. In this project, the server likely expects a variantId.
        // For home/shop pages, we'll try to add the first variant if not specified.
        
        const response = await fetch('/user/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: productId,
                variantId: variantId, // Can be null if server handles default
                quantity: quantity
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Success feedback
            if (typeof SweetAlert !== 'undefined' || typeof Swal !== 'undefined') {
                const swal = typeof Swal !== 'undefined' ? Swal : SweetAlert;
                swal.fire({
                    icon: 'success',
                    title: 'Added to Cart',
                    text: 'Item has been added to your cart successfully!',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#0D0D0D',
                    color: '#fff'
                });
            } else {
                alert("Item added to cart successfully!");
            }
            
            // Optional: Update cart badge if it exists
            const badge = document.getElementById('cart-badge');
            if (badge && result.cartCount) {
                badge.textContent = result.cartCount;
                badge.classList.remove('hidden');
            }
        } else {
            if (result.redirect) {
                window.location.href = result.redirect;
                return;
            }
            Swal.fire({
                icon: 'error',
                title: 'Add to Cart Failed',
                text: result.message || "Failed to add to cart",
                background: '#0D0D0D',
                color: '#fff'
            });
        }
    } catch (error) {
        console.error("Cart Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "An error occurred. Please try again.",
            background: '#0D0D0D',
            color: '#fff'
        });
    }
}
