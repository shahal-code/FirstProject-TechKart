import mongoose from "mongoose";
import Order from "../../models/ordersModel.js";
import Product from "../../models/productModel.js";

export const getAllOrders = async (query, page, limit) => {

    const skip = (page-1)*limit;

    const orders=await Order.find(query)
    .populate("userId")
    .populate("orderedItems.product")
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)

    const totalOrders=await Order.countDocuments(query);
    const totalPages=Math.ceil(totalOrders/limit);
    
    return {
        orders,totalOrders,totalPages
    };
};

export const getOrderById = async (orderId) => {
    return await Order.findById(orderId)
        .populate("userId")
        .populate("orderedItems.product");
};

export const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) return null;
    
    // If order is being cancelled or returned, restore stock
    if (status === 'Cancelled' || status === 'Returned') {
        if (order.status !== 'Cancelled' && order.status !== 'Returned') {
            for (const item of order.orderedItems) {
                await Product.updateOne(
                    { _id: item.product, "variants._id": new mongoose.Types.ObjectId(item.variantId) },
                    { $inc: { "variants.$.stock": item.quantity } }
                );
            }
        }
    } 
    // If order was cancelled/returned and is now being moved back to an active state, decrease stock
    else if (order.status === 'Cancelled' || order.status === 'Returned') {
        const activeStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        if (activeStatuses.includes(status)) {
            // Check if stock is available before decreasing
            for (const item of order.orderedItems) {
                const variantObjectId = new mongoose.Types.ObjectId(item.variantId);
                const product = await Product.findOne({ _id: item.product, "variants._id": variantObjectId });
                
                if (!product) throw new Error("Product or variant not found.");
                
                const variant = product.variants.id(variantObjectId);
                if (variant.stock < item.quantity) {
                    throw new Error(`Insufficient stock to revive order for product: ${product.name}`);
                }
            }

            for (const item of order.orderedItems) {
                await Product.updateOne(
                    { _id: item.product, "variants._id": new mongoose.Types.ObjectId(item.variantId) },
                    { $inc: { "variants.$.stock": -item.quantity } }
                );
            }
        }
    }
    return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
};