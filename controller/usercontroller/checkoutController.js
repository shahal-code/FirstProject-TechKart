import * as AddressService from "../../services/user/addressService.js";
import * as CartService from "../../services/user/cartService.js";
import OrderService from "../../services/user/orderService.js";

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

        const activeItems = cart.items.filter(item => {
            if (item.isUnavailable) {
                if (item.productId?.name) unavailableNames.push(item.productId.name);
                return false;
            }
            
            const variant = item.productId?.variants?.find(v => v._id.toString() === item.variantId.toString());
            if (variant) {
                subtotal += variant.price * item.quantity;
                return true;
            }
            
            if (item.productId?.name) unavailableNames.push(item.productId.name);
            return false;
        });

        // Update cart items to only show active ones in the view
        cart.items = activeItems;

        if (cart.items.length === 0) {
            // If everything is gone, maybe tell them why on the cart page
            return res.redirect('/user/cart');
        }

        const tax = subtotal * 0.18;
        const total = subtotal + tax;

        res.render('user/checkout/checkout', {
            user: req.user,
            addresses,
            cart,
            subtotal,
            tax,
            discount: 0, 
            total,
            unavailableNames,
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

        const address = await AddressService.getAddressById(addressId);
        if (!address) {
            return res.status(400).json({ success: false, message: "Selected address is invalid." });
        }

        // Use the service to handle logic
        const order = await OrderService.createOrder(userId, address, paymentMethod);

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
