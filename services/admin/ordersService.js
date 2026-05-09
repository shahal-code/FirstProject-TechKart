import Order from "../../models/ordersModel.js";

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