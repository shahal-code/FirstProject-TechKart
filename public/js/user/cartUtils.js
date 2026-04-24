// Shared AJAX utilities for Cart and Wishlist
window.addToCart = async function(productId, variantId, quantity = 1) {
    try {
        const response = await fetch('/user/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, variantId, quantity })
        });

        const result = await response.json();
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Added to Cart',
                text: 'Product added to your cart!',
                showCancelButton: true,
                confirmButtonText: 'View Cart',
                confirmButtonColor: '#0055FF',
                background: '#0D0D0D',
                color: '#fff'
            }).then((res) => {
                if (res.isConfirmed) {
                    window.location.href = '/user/cart';
                }
            });
            
            // Update cart badge if exists
            const badge = document.getElementById('cart-badge');
            if (badge) {
                const currentCount = parseInt(badge.textContent.trim()) || 0;
                badge.textContent = currentCount + quantity;
                badge.classList.remove('hidden');
            }
        } else {
            if (result.redirect) {
                window.location.href = result.redirect;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Failed to add item',
                    background: '#0D0D0D',
                    color: '#fff'
                });
            }
        }
        return result;
    } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, message: error.message };
    }
};

window.toggleWishlist = async function(event, productId, variantId) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    try {
        const response = await fetch('/user/wishlist/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, variantId })
        });
        const data = await response.json();
        if (data.success) {
            // Visual toggle of the heart icon
            const btn = event?.currentTarget;
            if (btn) {
                const heartIcon = btn.querySelector('.material-symbols-outlined');
                if (heartIcon) {
                    if (data.action === 'added') {
                        heartIcon.style.fontVariationSettings = "'FILL' 1";
                    } else {
                        heartIcon.style.fontVariationSettings = "'FILL' 0";
                    }
                }
            }

            Swal.fire({
                icon: data.action === 'added' ? 'success' : 'info',
                title: 'Wishlist Updated',
                text: data.message,
                background: '#0D0D0D',
                color: '#fff',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: data.message || 'Please login to manage your wishlist',
                background: '#0D0D0D',
                color: '#fff'
            });
        }
    } catch (error) {
        console.error('Wishlist error:', error);
    }
};
