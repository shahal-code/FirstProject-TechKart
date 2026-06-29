import * as cartService from "../../services/user/cartService.js";
import CouponService from "../../services/user/couponService.js";
import OrderService from "../../services/user/orderService.js";
import { CART_MESSAGES } from "../../constants/messages.js";
import { STATUS_CODES } from "../../constants/statusCode.js";


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

        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + tax;

        res.render("user/cart/cart", {
            cart,
            subtotal,
            tax,
            total,
            user: req.session.user || null,
            path: "/user/cart"
        });
    } catch (error) {
        console.error("Cart Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(CART_MESSAGES.LOAD_FAILED);
    }
};

// API: Add Item
export const addItem = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({
                success: false,
                message: CART_MESSAGES.LOGIN_REQUIRED,
                redirect: "/user/login"
            });
        }

        const { productId, variantId, quantity } = req.body;

        const cart = await cartService.addToCart(userId, productId, variantId, Number(quantity));
        res.status(STATUS_CODES.OK).json({ success: true, cart, message: CART_MESSAGES.ITEM_ADDED });
    } catch (error) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message, code: error.code || null });
    }
};

// API: Update Quantity
export const updateQuantity = async (req, res) => {
    try {
        const userId = req.session.user;
        const { itemId, quantity } = req.body;

        const cart = await cartService.updateQuantity(userId, itemId, Number(quantity));

        // SECURITY: After quantity change, check if applied coupon is still valid
        let couponRemoved = false;
        let couponWarning = null;
        if (req.session.appliedCoupon) {
            const newTotal = await CouponService.getServerCartTotal(userId);
            if (newTotal < req.session.appliedCoupon.minPurchaseAmount) {
                couponWarning = `Coupon "${req.session.appliedCoupon.code}" removed: cart total dropped below the \u20b9${req.session.appliedCoupon.minPurchaseAmount} minimum.`;
                delete req.session.appliedCoupon;
                await new Promise((resolve) => req.session.save(resolve));
                couponRemoved = true;
            }
        }

        res.status(STATUS_CODES.OK).json({ success: true, cart, message: CART_MESSAGES.QUANTITY_UPDATED, couponRemoved, couponWarning });
    } catch (error) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
    }
};

// API: Remove Item
export const removeItem = async (req, res) => {
    try {
        const userId = req.session.user;
        const { itemId } = req.body;

        const cart = await cartService.removeItem(userId, itemId);

        // SECURITY: After removal, immediately check if applied coupon is still valid.
        // This is the primary fix for the "apply coupon → remove item" scam.
        let couponRemoved = false;
        let couponWarning = null;
        if (req.session.appliedCoupon) {
            const newTotal = await CouponService.getServerCartTotal(userId);
            if (newTotal < req.session.appliedCoupon.minPurchaseAmount) {
                couponWarning = `Coupon "${req.session.appliedCoupon.code}" removed: cart total dropped below the \u20b9${req.session.appliedCoupon.minPurchaseAmount} minimum.`;
                delete req.session.appliedCoupon;
                await new Promise((resolve) => req.session.save(resolve));
                couponRemoved = true;
            }
        }

        res.status(STATUS_CODES.OK).json({ success: true, cart, message: CART_MESSAGES.ITEM_REMOVED, couponRemoved, couponWarning });
    } catch (error) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
    }
};

// API: Validate Checkout
export const validateCheckout = async (req, res) => {
    try {
        const userId = req.session.user;
        const { expectedTotal } = req.body;

        const { finalAmount } = await OrderService.validateCartAndBuildOrder(userId, req.session.appliedCoupon);

        const expected = Math.round(Number(expectedTotal));
        const final = Math.round(Number(finalAmount));

        if (expected !== final) {
            let message = CART_MESSAGES.PRICE_UPDATED_MSG;
            let title = CART_MESSAGES.PRICE_UPDATED_TITLE;
            let icon = "warning";

            if (final < expected) {
                message = CART_MESSAGES.OFFER_APPLIED_MSG;
                title = CART_MESSAGES.OFFER_APPLIED_TITLE;
                icon = "success";
            }

            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message, title, icon });
        }

        res.status(STATUS_CODES.OK).json({ success: true });
    } catch (error) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message || CART_MESSAGES.VALIDATION_FAILED });
    }
};

