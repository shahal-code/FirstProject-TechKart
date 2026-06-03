import * as AddressService from "../../services/user/addressService.js";
import * as CartService from "../../services/user/cartService.js";
import OrderService from "../../services/user/orderService.js";
import * as PaymentService from "../../services/user/paymentServices.js";
import Coupon from "../../models/couponModel.js";

/**
 * Render Checkout Page
 */
export const getCheckoutView = async (req, res) => {
    try {
        const userId = req.session.user;

        const [addresses, cart] = await Promise.all([
            AddressService.getAddressesByUserId(userId),
            CartService.getCart(userId)
        ]);

        if (!cart) {
            return res.redirect('/user/cart');
        }

        // Calculate totals and filter items for the view
        let subtotal = 0;
        let unavailableNames = [];
        let unavailableItemIds = [];

        const activeItems = cart.items.filter(item => {
            const product = item.productId;
            const category = product?.category_id;
            
            // Check if product or category is blocked
            const isBlocked = !product || product.is_blocked || (category && category.is_blocked);
            
            if (isBlocked) {
                if (product?.name) unavailableNames.push(product.name);
                unavailableItemIds.push(item._id);
                return false;
            }
            
            const variant = product?.variants?.find(v => v._id.toString() === item.variantId.toString());
            if (variant) {
                subtotal += variant.price * item.quantity;
                return true;
            }
            
            if (product?.name) unavailableNames.push(product.name);
            unavailableItemIds.push(item._id);
            return false;
        });

        // Perform Database Cleanup: Remove blocked items from the actual cart in DB
        if (unavailableItemIds.length > 0) {
            for (const itemId of unavailableItemIds) {
                await CartService.removeItem(userId, itemId.toString());
            }
            console.log(`Auto-cleaned ${unavailableItemIds.length} unavailable items from cart for user ${userId}`);
        }

        // Update cart items to only show active ones in the view
        cart.items = activeItems;

        if (cart.items.length === 0) {
            // If everything is gone, redirect back to cart where they will see the empty state
            return res.redirect('/user/cart');
        }

        const tax = subtotal * 0.18;
        let total = subtotal + tax;
        let discount = 0;
        let appliedCoupon = req.session.appliedCoupon;

        // Calculate discount if a coupon is in session
        if (appliedCoupon) {
            if (total >= appliedCoupon.minPurchaseAmount) {
                if (appliedCoupon.discountType === 'percentage') {
                    discount = (total * appliedCoupon.discountValue) / 100;
                    if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
                        discount = appliedCoupon.maxDiscountAmount;
                    }
                } else {
                    discount = appliedCoupon.discountValue;
                }
                total = total - discount;
                if (total < 0) total = 0;
            } else {
                // Cart total is too low, remove coupon silently
                delete req.session.appliedCoupon;
                appliedCoupon = null;
            }
        }

        res.render('user/checkout/checkout', {
            user: res.locals.user || req.user,
            addresses,
            cart,
            subtotal,
            tax,
            discount, 
            total,
            appliedCoupon,
            unavailableNames,
            path: '/user/checkout',
            razorpayKey: process.env.RAZORPAY_KEY_ID

        });
    } catch (error) {
        console.error("Checkout Page Error:", error);
        res.status(500).redirect('/user/cart');
    }
};


//  Process Order Placement

export const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const {
            addressId,
            paymentMethod,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!addressId || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const address = await AddressService.getAddressById(addressId);
        if (!address) {
            return res.status(400).json({ success: false, message: "Selected address is invalid." });
        }

        if (paymentMethod === "UPI") {
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({ success: false, message: "Payment verification details are required." });
            }

            const isPaymentValid = PaymentService.verifyRazorpaySignature({
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature
            });

            if (!isPaymentValid) {
                return res.status(400).json({ success: false, message: "Payment verification failed." });
            }
        }

        // Use the service to handle logic
        const order = await OrderService.createOrder(userId, address, paymentMethod, false, req.session.appliedCoupon);

        // If success, save coupon usage and clear session
        if (req.session.appliedCoupon) {
            await Coupon.updateOne({ _id: req.session.appliedCoupon._id }, { $push: { usedBy: userId } });
            delete req.session.appliedCoupon;
            await new Promise((resolve) => req.session.save(resolve));
        }

        res.json({
            success: true,
            message: "Order placed successfully!",
            redirectUrl: `/user/checkout/order-success?id=${order.orderId}`
        });

    } catch (error) {
        console.error("Order Placement Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to place order. Please try again."
        });
    }
};

/**
 * Render Order Success Page
 */
export const getOrderSuccessView = async (req, res) => {
    try {
        const orderId = req.query.id;
        if (!orderId) return res.redirect('/user/shop');
        
        res.render('user/checkout/orderSuccess', { 
            orderId,
            path: '/user/checkout/order-success'
        });
    } catch (error) {
        console.error("Order Success Page Error:", error);
        res.redirect('/user/shop');
    }
};

/**
 * Handle Failed Payment Order Creation
 */
export const placeOrderFailed = async (req, res) => {
    try {
        const userId = req.session.user;
        const { addressId, paymentMethod } = req.body;

        if (!addressId || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const address = await AddressService.getAddressById(addressId);
        if (!address) {
            return res.status(400).json({ success: false, message: "Selected address is invalid." });
        }

        // Create order with 'Failed' status by passing true as the 4th parameter
        const order = await OrderService.createOrder(userId, address, paymentMethod, true, req.session.appliedCoupon);

        // If success, save coupon usage and clear session
        if (req.session.appliedCoupon) {
            await Coupon.updateOne({ _id: req.session.appliedCoupon._id }, { $push: { usedBy: userId } });
            delete req.session.appliedCoupon;
            await new Promise((resolve) => req.session.save(resolve));
        }

        res.json({
            success: true,
            message: "Order placed with failed payment.",
            redirectUrl: `/user/checkout/payment-failure?id=${order.orderId}`
        });

    } catch (error) {
        console.error("Failed Order Placement Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to process order failure."
        });
    }
};

/**
 * Render Payment Failure Page
 */
export const getPaymentFailureView = async (req, res) => {
    try {
        const orderId = req.query.id;
        const userId = req.session.user;
        if (!orderId) return res.redirect('/user/shop');
        
        const order = await OrderService.getOrderByDisplayId(orderId, userId);
        if (!order) return res.redirect('/user/shop');

        res.render('user/checkout/paymentFailure', { 
            orderId,
            order,
            user: res.locals.user || req.user,
            razorpayKey: process.env.RAZORPAY_KEY_ID,
            path: '/user/checkout/payment-failure'
        });
    } catch (error) {
        console.error("Payment Failure Page Error:", error);
        res.redirect('/user/shop');
    }
};

/**
 * Handle Retry Payment
 */
export const retryOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing required verification fields." });
        }

        const isPaymentValid = PaymentService.verifyRazorpaySignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature
        });

        if (!isPaymentValid) {
            return res.status(400).json({ success: false, message: "Payment verification failed." });
        }

        await OrderService.updatePaymentStatus(orderId, userId, 'Paid');

        res.json({
            success: true,
            message: "Payment successful!",
            redirectUrl: `/user/checkout/order-success?id=${orderId}`
        });
    } catch (error) {
        console.error("Retry Order Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update payment status."
        });
    }
};

/**
 * Apply Coupon
 */
export const applyCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        const userId = req.session.user;

        if (!code) {
            return res.status(400).json({ success: false, message: "Please enter a coupon code." });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid or expired coupon." });
        }

        if (new Date() > coupon.expirationDate) {
            return res.status(400).json({ success: false, message: "This coupon has expired." });
        }

        if (coupon.usedBy.includes(userId)) {
            return res.status(400).json({ success: false, message: "You have already used this coupon." });
        }

        if (cartTotal < coupon.minPurchaseAmount) {
            return res.status(400).json({ success: false, message: `Minimum purchase of ₹${coupon.minPurchaseAmount} required.` });
        }

        req.session.appliedCoupon = coupon;
        req.session.save((err) => {
            if (err) throw err;
            res.json({ success: true, message: "Coupon applied successfully!" });
        });
    } catch (error) {
        console.error("Apply Coupon Error:", error);
        res.status(500).json({ success: false, message: "Failed to apply coupon." });
    }
};

/**
 * Remove Coupon
 */
export const removeCoupon = async (req, res) => {
    try {
        delete req.session.appliedCoupon;
        req.session.save((err) => {
            if (err) throw err;
            res.json({ success: true, message: "Coupon removed successfully!" });
        });
    } catch (error) {
        console.error("Remove Coupon Error:", error);
        res.status(500).json({ success: false, message: "Failed to remove coupon." });
    }
};
