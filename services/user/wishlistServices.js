import Wishlist from "../../models/wishlistModel.js";
import Product from "../../models/productModel.js";

// Fetch user's wishlist
export const getWishlist = async (userId) => {
    let wishlist = await Wishlist.findOne({ userId }).populate({
        path: 'products',
        match: { is_blocked: false } // only return products that aren't blocked
    });

    if (!wishlist) {
        wishlist = await Wishlist.create({ userId, products: [] });
    }

    return wishlist;
};

// Toggle product in wishlist
export const toggleWishlist = async (userId, productId) => {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        wishlist = new Wishlist({ userId, products: [productId] });
        await wishlist.save();
        return { action: 'added', wishlist };
    }

    const index = wishlist.products.indexOf(productId);
    if (index === -1) {
        wishlist.products.push(productId);
        await wishlist.save();
        return { action: 'added', wishlist };
    } else {
        wishlist.products.splice(index, 1);
        await wishlist.save();
        return { action: 'removed', wishlist };
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (userId, productId) => {
    let wishlist = await Wishlist.findOne({ userId });

    if (wishlist) {
        wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
        await wishlist.save();
    }

    return wishlist;
};

// Fetch wishlist product IDs as an array
export const getWishlistProductIds = async (userId) => {
    if (!userId) return [];
    const wishlist = await Wishlist.findOne({ userId });
    return wishlist ? wishlist.products.map(id => id.toString()) : [];
};
