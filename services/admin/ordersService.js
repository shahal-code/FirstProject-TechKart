import mongoose from "mongoose";
import Order from "../../models/ordersModel.js";
import Product from "../../models/productModel.js";

export const getAllOrders = async (queryParams, page, limit) => {
    const { startDate, endDate, status, paymentMethod, search } = queryParams;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by Status
    if (status) query.status = status;
    // Filter by Payment Method
    if (paymentMethod) query.paymentMethod = paymentMethod;
    // Filter by Date Range
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.createdAt.$lte = end;
        }
    }

    // Search Logic
    if (search) {
        // We need User model here, assuming it's available or we can import it
        const User = (await import("../../models/userModel.js")).default;
        const matchingUsers = await User.find({
            fullname: { $regex: search, $options: 'i' }
        }).select('_id');
        const userIds = matchingUsers.map(u => u._id);

        const matchingProducts = await Product.find({
            name: { $regex: search, $options: 'i' }
        }).select('_id');
        const productIds = matchingProducts.map(p => p._id);

        query.$or = [
            { orderId: { $regex: search, $options: 'i' } },
            { userId: { $in: userIds } },
            { "orderedItems.product": { $in: productIds } }
        ];
    }

    const orders = await Order.find(query)
        .populate("userId")
        .populate("orderedItems.product")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    return {
        orders, totalOrders, totalPages
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

    // If global status is updated, update all individual items too
    order.status = status;
    order.orderedItems.forEach(item => {
        if (item.status !== 'Cancelled' && item.status !== 'Returned') {
            item.status = status;
        }
    });

    return await order.save();
};

export const updateOrderItemStatus = async (orderId, itemId, status) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found.");

    const item = order.orderedItems.id(itemId);
    if (!item) throw new Error("Item not found in order.");

    const oldStatus = item.status;
    if (oldStatus === status) return order;

    // Stock Management
    if (status === 'Cancelled' || status === 'Returned') {
        if (oldStatus !== 'Cancelled' && oldStatus !== 'Returned') {
            await Product.updateOne(
                { _id: item.product, "variants._id": new mongoose.Types.ObjectId(item.variantId) },
                { $inc: { "variants.$.stock": item.quantity } }
            );
        }
    } else if (oldStatus === 'Cancelled' || oldStatus === 'Returned') {
        // Re-deduct stock if revived
        const variantObjectId = new mongoose.Types.ObjectId(item.variantId);
        const product = await Product.findOne({ _id: item.product, "variants._id": variantObjectId });
        const variant = product.variants.id(variantObjectId);

        if (variant.stock < item.quantity) {
            throw new Error("Insufficient stock to revive this item.");
        }

        await Product.updateOne(
            { _id: item.product, "variants._id": variantObjectId },
            { $inc: { "variants.$.stock": -item.quantity } }
        );
    }

    item.status = status;

    // If all items have the same status, update the global order status
    const statuses = order.orderedItems.map(i => i.status);
    const uniqueStatuses = [...new Set(statuses)];

    if (uniqueStatuses.length === 1) {
        order.status = uniqueStatuses[0];
    } else {
        // Mixed statuses - if any item is processing/shipped, order is active
        if (statuses.includes('Delivered')) order.status = 'Shipped'; // Or partial delivery logic
        else if (statuses.includes('Shipped')) order.status = 'Shipped';
        else if (statuses.includes('Out for Delivery')) order.status = 'Out for Delivery';
        else if (statuses.includes('Pending')) order.status = 'Pending';
    }

    await order.save();
    return order;
};