import * as cartService from "../../services/user/cartService.js";

// Render Cart Page
export const getCartView = async (req, res) => {
    try {
        const userId = req.session.user;
        const cart = await cartService.getCart(userId);

        let subtotal = 0;
        if (cart && cart.items) {
            cart.items.forEach(item => {
                if (!item.isUnavailable) {
                    const product = item.productId;
                    if (product) {
                        const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
                        if (variant) {
                            subtotal += variant.price * item.quantity;
                        }
                    }
                }
            });
        }

        const tax = subtotal * 0.08; // 8% placeholder tax
        const total = subtotal + tax;

        res.render("user/cart", {
            cart,
            subtotal,
            tax,
            total,
            user: req.session.user || null,
            path: "/user/cart"
        });
    } catch (error) {
        console.error("Cart Error:", error);
        res.status(500).send("Failed to load shopping cart");
    }
};

// API: Add Item
export const addItem = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please login to add items to cart",
                redirect: "/user/login"
            });
        }

        const { productId, variantId, quantity } = req.body;

        const cart = await cartService.addToCart(userId, productId, variantId, Number(quantity));
        res.status(200).json({ success: true, cart, message: "Item added to cart successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message, code: error.code || null });
    }
};

// API: Update Quantity
export const updateQuantity = async (req, res) => {
    try {
        const userId = req.session.user;
        const { itemId, quantity } = req.body;

        const cart = await cartService.updateQuantity(userId, itemId, Number(quantity));
        res.status(200).json({ success: true, cart, message: "Quantity updated" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// API: Remove Item
export const removeItem = async (req, res) => {
    try {
        const userId = req.session.user;
        const { itemId } = req.body;

        const cart = await cartService.removeItem(userId, itemId);
        res.status(200).json({ success: true, cart, message: "Item removed from cart" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
