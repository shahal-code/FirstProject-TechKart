import Cart from "../../models/cartModel.js";
import Product from "../../models/productModel.js";
import Wishlist from "../../models/wishlistModel.js";

// Fetch user's cart
export const getCart = async (userId) => {
    let cart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        model: 'Product'
    });

    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }

    // Lazy Cleanup: Filter out products that are blocked
    const originalItemCount = cart.items.length;
    cart.items = cart.items.filter(item => item.productId && !item.productId.is_blocked);
    
    if (cart.items.length !== originalItemCount) {
        await cart.save();
    }

    return cart;
};

// Add item to cart
export const addToCart = async (userId, productId, variantId, quantity = 1) => {
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
        cart = new Cart({ userId, items: [] });
    }

    // Check if product exists and variant is valid
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    if (product.is_blocked) throw new Error("This product is currently unavailable");

    const variant = product.variants.id(variantId);
    if (!variant) throw new Error("Variant not found");

    if (variant.stock < quantity) {
        throw new Error(`Only ${variant.stock} items left in stock`);
    }

    const MAX_QUANTITY_PER_PRODUCT = 5;

    // Check if already in cart
    const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId && item.variantId.toString() === variantId
    );

    if (existingItemIndex > -1) {
        const totalQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (totalQuantity > MAX_QUANTITY_PER_PRODUCT) {
            throw new Error(`Maximum quantity per product is ${MAX_QUANTITY_PER_PRODUCT}`);
        }
        
        if (totalQuantity > variant.stock) {
             throw new Error("Cannot add more than available stock");
        }
        cart.items[existingItemIndex].quantity = totalQuantity;
    } else {
        if (quantity > MAX_QUANTITY_PER_PRODUCT) {
            throw new Error(`Maximum quantity per product is ${MAX_QUANTITY_PER_PRODUCT}`);
        }
        cart.items.push({
            productId,
            variantId,
            quantity
        });
    }

    await cart.save();

    // Remove from wishlist if it exists there
    await Wishlist.updateOne({ userId }, { $pull: { products: productId } });

    return cart;
};

// Update item quantity
export const updateQuantity = async (userId, itemId, newQuantity) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    const item = cart.items.id(itemId);
    if (!item) throw new Error("Item not found in cart");

    const product = await Product.findById(item.productId);
    const variant = product.variants.id(item.variantId);

    const MAX_QUANTITY_PER_PRODUCT = 5;

    if (newQuantity > MAX_QUANTITY_PER_PRODUCT) {
        throw new Error(`Maximum quantity per product is ${MAX_QUANTITY_PER_PRODUCT}`);
    }

    if (newQuantity > variant.stock) {
        throw new Error(`Only ${variant.stock} items left in stock`);
    }

    item.quantity = newQuantity;
    await cart.save();
    return cart;
};

// Remove item from cart
export const removeItem = async (userId, itemId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    return cart;
};
