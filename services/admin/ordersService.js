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

    const activeStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Out for Delivery'];
    const terminalStatuses = ['Cancelled', 'Returned'];

    for (const item of order.orderedItems) {
        const oldItemStatus = item.status;

        // If item was active and is now being cancelled/returned, restore stock
        if (terminalStatuses.includes(status) && activeStatuses.includes(oldItemStatus)) {
            await Product.updateOne(
                { _id: item.product, "variants._id": new mongoose.Types.ObjectId(item.variantId) },
                { $inc: { "variants.$.stock": item.quantity } }
            );
        }
        // If item was cancelled/returned and is now being revived, deduct stock
        else if (activeStatuses.includes(status) && terminalStatuses.includes(oldItemStatus)) {
            const variantObjectId = new mongoose.Types.ObjectId(item.variantId);
            const product = await Product.findOne({ _id: item.product, "variants._id": variantObjectId });
            const variant = product.variants.id(variantObjectId);

            if (variant.stock < item.quantity) {
                throw new Error(`Insufficient stock to revive item: ${product.name}`);
            }

            await Product.updateOne(
                { _id: item.product, "variants._id": variantObjectId },
                { $inc: { "variants.$.stock": -item.quantity } }
            );
        }
        item.status = status;
    }

    order.status = status;
    order.markModified("orderedItems");
    console.log(`Updating Order ${orderId} to status: ${status}`);
    await order.save();
    return order;
};

export const updateOrderItemStatus = async (orderId, itemId, status) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found.");

    const item = order.orderedItems.id(itemId);
    if (!item) throw new Error("Item not found in order.");

    const oldStatus = item.status;
    if (oldStatus === status) return order;

    console.log(`Updating Item ${itemId} in Order ${orderId} from ${oldStatus} to ${status}`);

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
        const terminalStatuses = ['Delivered', 'Returned', 'Cancelled'];
        const allTerminal = statuses.every(s => terminalStatuses.includes(s));

        if (allTerminal) {
            if (statuses.includes('Delivered')) order.status = 'Delivered';
            else if (statuses.includes('Returned')) order.status = 'Returned';
            else order.status = 'Cancelled';
        } else {
            if (statuses.includes('Out for Delivery')) order.status = 'Out for Delivery';
            else if (statuses.includes('Shipped')) order.status = 'Shipped';
            else if (statuses.includes('Processing')) order.status = 'Processing';
            else order.status = 'Pending';
        }
    }

    order.markModified("orderedItems");
    await order.save();
    return order;
};

export const getReturnRequests = async (queryParams ,page, limit) => {
    const skip = (page - 1) * limit;

    const {search}=queryParams;

    // Find orders where at least one item has a return request
    let query = {
        "orderedItems.status": "Return Request"
    };

    if(search){
        const cleanSearch = search.replace("#","").trim();
        const User=(await import ("../../models/userModel.js")).default


        const matchingUsers=await User.find({
            fullname:{$regex:cleanSearch,$options:"i"}
        }).select("_id");

        const userIds=matchingUsers.map(u=>u._id);

        const matchingProduct=await Product.find({
            name:{$regex:cleanSearch,$options:"i"}
        }).select("_id");

        let productIds=matchingProduct.map(p=>p._id);

          query = {
            $and: [
                { "orderedItems.status": "Return Request" },

                {
                    $or: [
                        { orderId: { $regex: cleanSearch, $options: "i" } },
                        { userId: { $in: userIds } },
                        { "orderedItems.product": { $in: productIds } },
                        { "orderedItems.returnReason": { $regex: cleanSearch, $options: "i" } }
                    ]
                }
            ]
        };
    }
    

    const orders = await Order.find(query)
        .populate("userId")
        .populate("orderedItems.product")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    return { orders, totalPages, totalOrders };
};