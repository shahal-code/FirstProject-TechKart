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
    return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
};