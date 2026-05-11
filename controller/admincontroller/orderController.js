import * as OrderService from "../../services/admin/ordersService.js";

export const loadOrders = async (req, res) => {
    try {
        const { startDate, endDate, status, paymentMethod, search } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

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
                end.setHours(23, 59, 59, 999); // Include the entire end day
                query.createdAt.$lte = end;
            }
        }
        //search logic
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } }
            ];
        }

        const { orders, totalPages, totalOrders } = await OrderService.getAllOrders(query, page, limit);
        res.render("admin/orders/orders", {
            orders,
            page,
            totalPages,
            totalOrders,
            activePage: "orders",
            filters: req.query // This keeps your filter inputs filled on the page
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