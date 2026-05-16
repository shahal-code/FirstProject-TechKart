import * as OrderService from "../../services/admin/ordersService.js";


export const loadOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const { orders, totalPages, totalOrders } = await OrderService.getAllOrders(req.query, page, limit);
        
        res.render("admin/orders/orders", {
            orders,
            page,
            totalPages,
            totalOrders,
            limit,
            activePage: "orders",
            filters: req.query
        });
    } catch (error) {
        console.error("Error loading admin orders:", error);
        res.status(500).render("admin/error", { message: "Failed to load orders" });
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await OrderService.getOrderById(orderId);
        if (!order) {
            return res.status(404).render("admin/error", { message: "Order not found" });
        }
        res.render("admin/orders/orderDetails", { order, activePage: "orders" });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).render("admin/error", { message: "Failed to fetch order details" });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
        if (updatedOrder) {
            res.json({ success: true, message: "Order status updated successfully" });
        } else {
            res.status(400).json({ success: false, message: "Failed to update status" });
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(400).json({ success: false, message: error.message || "Internal server error" });
    }
};

export const updateOrderItemStatus = async (req, res) => {
    try {
        const { orderId, itemId, status } = req.body;
        const updatedOrder = await OrderService.updateOrderItemStatus(orderId, itemId, status);
        if (updatedOrder) {
            res.json({ success: true, message: "Item status updated successfully" });
        } else {
            res.status(400).json({ success: false, message: "Failed to update item status" });
        }
    } catch (error) {
        console.error("Error updating order item status:", error);
        res.status(400).json({ success: false, message: error.message || "Internal server error" });
    }
};