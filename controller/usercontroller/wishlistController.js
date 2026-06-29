import * as wishlistService from "../../services/user/wishlistServices.js";
import { WISHLIST_MESSAGES } from "../../constants/messages.js";

// Render Wishlist Page
export const getWishlistView = async (req, res) => {
    try {
        const userId = req.session.user;
        const wishlist = await wishlistService.getWishlist(userId);

        res.render("user/wishlist/wishlist", {
            wishlist,
            user: req.session.user || null,
            path: "/user/wishlist"
        });
    } catch (error) {
        console.error("Wishlist Error:", error);
        res.status(500).send(WISHLIST_MESSAGES.LOAD_FAILED);
    }
};

// API: Toggle Wishlist
export const toggleWishlist = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.status(401).json({ success: false, message: WISHLIST_MESSAGES.LOGIN_REQUIRED });
        }

        const { productId, variantId } = req.body;
        if (!variantId) {
            return res.status(400).json({ success: false, message: WISHLIST_MESSAGES.VARIANT_REQUIRED });
        }

        const result = await wishlistService.toggleWishlist(userId, productId, variantId);
        const wishlistCount = result.wishlist.products.length;
        res.status(200).json({
            success: true,
            action: result.action,
            message: result.action === 'added' ? WISHLIST_MESSAGES.ADDED : WISHLIST_MESSAGES.REMOVED,
            wishlistCount
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// API: Remove from Wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user;
        const { productId, variantId } = req.body;
        const wishlist = await wishlistService.removeFromWishlist(userId, productId, variantId);
        const wishlistCount = wishlist ? wishlist.products.length : 0;
        res.status(200).json({ success: true, message: WISHLIST_MESSAGES.REMOVED, wishlistCount });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
