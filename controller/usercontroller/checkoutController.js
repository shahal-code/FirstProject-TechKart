import Cart from "../../models/cartModel.js";
import Address from "../../models/addressModel.js";
import OrderService from "../../services/user/orderService.js";

/**
 * Render Checkout Page
 */
export const getCheckoutView = async (req, res) => {
    try {
        const userId = req.session.user;

        const [addresses, cart] = await Promise.all([
            Address.find({ user_id: userId }),
            Cart.findOne({ userId }).populate('items.productId')
        ]);

        if (!cart || cart.items.length === 0) {
            return res.redirect('/user/cart');
        }

        // Calculate totals for the view
        let subtotal = 0;
        cart.items.forEach(item => {
            const variant = item.productId.variants.find(v => v._id.toString() === item.variantId.toString());
            if (variant) subtotal += variant.price * item.quantity;
        });

        const tax = subtotal * 0.18;
        const total = subtotal + tax;

        res.render('user/checkout/checkout', {
            user: req.user,
            addresses,
            cart,
            subtotal,
            tax,
            discount: 0, // Placeholder for future coupon logic
            total,
            path: '/user/checkout'
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
        const { addressId, paymentMethod } = req.body;

        if (!addressId || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(400).json({ success: false, message: "Selected address is invalid." });
        }

        // Use the service to handle logic
        const order = await OrderService.createOrder(userId, address, paymentMethod);

        res.json({
            success: true,
            message: "Order placed successfully!",
            redirectUrl: "/user/dashboard" // Or a specific order success page
        });

    } catch (error) {
        console.error("Order Placement Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to place order. Please try again."
        });
    }
};
