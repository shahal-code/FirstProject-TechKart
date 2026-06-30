import * as wishlistService from "../../services/user/wishlistServices.js";
import { WISHLIST_MESSAGES } from "../../constants/messages.js";
import { STATUS_CODES } from "../../constants/statusCode.js";


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
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(WISHLIST_MESSAGES.LOAD_FAILED);
    }
};

// API: Toggle Wishlist
export const toggleWishlist = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ success: false, message: WISHLIST_MESSAGES.LOGIN_REQUIRED });
        }

        const { productId, variantId } = req.body;
        if (!variantId) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: WISHLIST_MESSAGES.VARIANT_REQUIRED });
        }

        const result = await wishlistService.toggleWishlist(userId, productId, variantId);
        const wishlistCount = result.wishlist.products.length;
        res.status(STATUS_CODES.OK).json({
            success: true,
            action: result.action,
            message: result.action === 'added' ? WISHLIST_MESSAGES.ADDED : WISHLIST_MESSAGES.REMOVED,
            wishlistCount
        });
    } catch (error) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
    }
};

// API: Remove from Wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user;
        const { productId, variantId } = req.body;
        const wishlist = await wishlistService.removeFromWishlist(userId, productId, variantId);
        const wishlistCount = wishlist ? wishlist.products.length : 0;
        res.status(STATUS_CODES.OK).json({ success: true, message: WISHLIST_MESSAGES.REMOVED, wishlistCount });
    } catch (error) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
    }
};
