// Alert for unavailable items
window.checkoutData = window.checkoutData || {};

if (window.checkoutData.unavailableItems && window.checkoutData.unavailableItems.length > 0) {
    Swal.fire({
        icon: 'warning',
        title: 'Unavailable Items',
        text: `The following products are unavailable and remain in your cart until you remove them: ${window.checkoutData.unavailableItems.join(', ')}`,
        background: '#161b22',
        color: '#fff',
        confirmButtonColor: '#0055ff'
    });
}

async function removeFromCheckout(itemId) {
    try {
        const response = await fetch('/user/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId })
        });
        const result = await response.json();
        if (result.success) {
            window.location.reload();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error("Remove Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.message || 'Failed to remove item',
            background: '#161b22',
            color: '#fff'
        });
    }
}

async function applyCoupon() {
    const code = document.getElementById('couponCode').value.trim();
    if (!code) {
        Swal.fire({ icon: 'warning', title: 'Empty Code', text: 'Please enter a coupon code.', background: '#161b22', color: '#fff' });
        return;
    }

    try {
        const cartTotal = Number(window.checkoutData.subtotal) || 0;
        const response = await fetch('/user/checkout/apply-coupon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, cartTotal })
        });
        const result = await readJsonResponse(response);
        
        if (result.success) {
            Swal.fire({ icon: 'success', title: 'Success!', text: result.message, background: '#161b22', color: '#fff', timer: 1500, showConfirmButton: false })
            .then(() => window.location.reload());
        } else {
            Swal.fire({ icon: 'error', title: 'Oops...', text: result.message, background: '#161b22', color: '#fff' });
        }
    } catch (error) {
        console.error("Apply Coupon Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Coupon Error',
            text: error.message || 'Failed to apply coupon.',
            background: '#161b22',
            color: '#fff'
        });
    }
}

async function removeCoupon() {
    try {
        const response = await fetch('/user/checkout/remove-coupon', { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            window.location.reload();
        }
    } catch (error) {
        console.error("Remove Coupon Error:", error);
    }
}

function showOrderError(error) {
    Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: error.message,
        background: '#161b22',
        color: '#fff',
        confirmButtonColor: '#0055ff'
    });
}

function restoreSubmitButton(submitBtn, originalBtnContent) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
}

async function readJsonResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 'Server returned a non-JSON response');
    }

    return await response.json();
}

async function placeOrder(data) {
    const response = await fetch('/user/checkout/place-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await readJsonResponse(response);

    if (!result.success) {
        throw new Error(result.message || 'Something went wrong');
    }

    Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: 'Your order has been placed successfully.',
        showConfirmButton: false,
        timer: 3000,
        background: '#161b22',
        color: '#fff'
    }).then(() => {
        window.location.href = result.redirectUrl || '/user/dashboard';
    });
}

const RAZORPAY_MAX_AMOUNT = 500000; // ₹5,00,000

async function handleRazorpayPayment(data, submitBtn, originalBtnContent) {
    if (typeof Razorpay === 'undefined') {
        throw new Error('Razorpay checkout is not loaded. Please refresh and try again.');
    }

    const orderTotal = window.checkoutData.total;
    if (orderTotal > RAZORPAY_MAX_AMOUNT) {
        restoreSubmitButton(submitBtn, originalBtnContent);
        Swal.fire({
            icon: 'warning',
            title: 'Amount Limit Exceeded',
            html: `UPI/Online payment is limited to <b>₹5,00,000</b> per transaction.<br><br>Your order total is <b>₹${orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</b>.<br><br>Please select <b>Cash on Delivery</b> instead.`,
            background: '#161b22',
            color: '#fff',
            confirmButtonColor: '#0055ff',
            confirmButtonText: 'Got it'
        });
        return;
    }

    const response = await fetch('/user/payment/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ amount: window.checkoutData.total })
    });

    const result = await readJsonResponse(response);

    if (!result.success) {
        throw new Error(result.message || 'Unable to create payment order');
    }

    const options = {
        key: window.checkoutData.razorpayKey,
        amount: result.order.amount,
        currency: result.order.currency,
        order_id: result.order.id,
        name: "TechKart",
        description: "Order payment",
        prefill: {
            name: window.checkoutData.userName,
            email: window.checkoutData.userEmail,
            contact: window.checkoutData.userPhone
        },
        config: {
            display: {
                blocks: {
                    upi_qr: {
                        name: "Scan and Pay via UPI",
                        instruments: [
                            {
                                method: "upi",
                                flows: ["qr"]
                            },
                            {
                                method: "upi"
                            }
                        ]
                    }
                },
                sequence: ["block.upi_qr", "upi"],
                preferences: {
                    show_default_blocks: true
                }
            }
        },
        handler: async function (paymentResponse) {
            try {
                const verifyResponse = await fetch('/user/payment/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(paymentResponse)
                });

                const verifyResult = await readJsonResponse(verifyResponse);

                if (!verifyResult.success) {
                    throw new Error(verifyResult.message || 'Payment verification failed');
                }

                await placeOrder({
                    ...data,
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_signature: paymentResponse.razorpay_signature
                });
            } catch (error) {
                showOrderError(error);
                restoreSubmitButton(submitBtn, originalBtnContent);
            }
        },
        modal: {
            ondismiss: async function () {
                await handleFailedPaymentAttempt();
            }
        }
    };

    let failureHandled = false;
    async function handleFailedPaymentAttempt() {
        if (failureHandled) return;
        failureHandled = true;

        try {
            const failResponse = await fetch('/user/checkout/place-order-failed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await readJsonResponse(failResponse);
            if (result.success) {
                window.location.href = result.redirectUrl || '/user/checkout/payment-failure';
                return;
            }
        } catch (e) {
            console.error(e);
        }

        restoreSubmitButton(submitBtn, originalBtnContent);
    }

    const razorpay = new Razorpay(options);
    razorpay.on('payment.failed', async function () {
        await handleFailedPaymentAttempt();
    });
    razorpay.open();
}

document.getElementById('checkout-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    if (window.checkoutData.unavailableItems && window.checkoutData.unavailableItems.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Unavailable Items',
            text: 'Remove unavailable items from the cart before placing the order.',
            background: '#161b22',
            color: '#fff',
            confirmButtonColor: '#0055ff'
        });
        return;
    }

    // Validate address selection
    if (!data.addressId) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Address',
            text: 'Please select or add a shipping address to continue.',
            background: '#161b22',
            color: '#fff',
            confirmButtonColor: '#0055ff'
        });
        return;
    }

    // Confirm order placement
    const confirmResult = await Swal.fire({
        title: 'Confirm Order?',
        text: `You are about to place an order for ₹${window.checkoutData.total.toFixed(2)} using ${data.paymentMethod}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0055ff',
        cancelButtonColor: '#30363d',
        confirmButtonText: 'Yes, Place Order',
        background: '#161b22',
        color: '#fff'
    });

    if (!confirmResult.isConfirmed) return;

    // Show loading state
    const submitBtn = document.getElementById('place-order-btn');
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> PROCESSING...';

    try {
        if (data.paymentMethod === "UPI") {
            await handleRazorpayPayment(data, submitBtn, originalBtnContent);
        } else {
            await placeOrder(data);
        }
    } catch (error) {
        showOrderError(error);
        restoreSubmitButton(submitBtn, originalBtnContent);
    }
});

// Add visual feedback for radio selections
const paymentRadios = document.querySelectorAll('.payment-radio');
paymentRadios.forEach(radio => {
    radio.addEventListener('change', function () {
        // The CSS peer-checked handles the cards, but we can add more logic here if needed
    });
});
