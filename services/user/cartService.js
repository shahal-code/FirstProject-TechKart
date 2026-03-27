import Cart from "../../models/cartModel.js";
import Product from "../../models/productModel.js";

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

    // Check if already in cart
    const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId && item.variantId.toString() === variantId
    );

    if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
        
        if (cart.items[existingItemIndex].quantity > variant.stock) {
             throw new Error("Cannot add more than available stock");
        }
    } else {
        cart.items.push({
            productId,
            variantId,
            quantity
        });
    }

    await cart.save();
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
