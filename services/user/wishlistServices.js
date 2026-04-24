import Wishlist from "../../models/wishlistModel.js";

// Fetch user's wishlist
export const getWishlist = async (userId) => {
    if (!userId) return { products: [] };

    let wishlist = await Wishlist.findOne({ userId }).populate("products.productId").lean();

    if (!wishlist) {
        wishlist = await Wishlist.create({ userId, products: [] });
        return wishlist;
    }

    // Filter out blocked products or malformed entries
    wishlist.products = wishlist.products.filter(
        item => item && item.productId && item.productId.is_blocked !== true
    );

    return wishlist;
};

// Toggle product in wishlist
export const toggleWishlist = async (userId, productId, variantId) => {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        wishlist = new Wishlist({ userId, products: [{ productId, variantId }] });
        await wishlist.save();
        return { action: 'added', wishlist };
    }

    // Filter out old malformed entries if any exist
    wishlist.products = wishlist.products.filter(p => p && p.productId);

    const index = wishlist.products.findIndex(p => p.productId.toString() === productId && p.variantId.toString() === variantId);
    
    if (index === -1) {
        wishlist.products.push({ productId, variantId });
        await wishlist.save();
        return { action: 'added', wishlist };
    } else {
        wishlist.products.splice(index, 1);
        await wishlist.save();
        return { action: 'removed', wishlist };
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (userId, productId, variantId) => {
    let wishlist = await Wishlist.findOne({ userId });

    if (wishlist) {
        wishlist.products = wishlist.products.filter(p => p && p.productId && !(p.productId.toString() === productId && p.variantId.toString() === variantId));
        await wishlist.save();
    }

    return wishlist;
};

// Fetch wishlist product IDs as an array
export const getWishlistProductIds = async (userId) => {
    if (!userId) return [];
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return [];
    
    return wishlist.products.map(p => p && p.productId ? p.productId.toString() : null).filter(Boolean);
};
