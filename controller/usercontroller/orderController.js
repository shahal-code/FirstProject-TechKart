import orderService from "../../services/user/orderService.js";
import { generateInvoice } from "../../utils/invoiceGenerator.js";
import Product from "../../models/productModel.js";

export const getOrders = async (req, res) => {
    try {
        const userId = req.session.user;
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const limit = 5;

        let query = {};
        if (search) {
            // Step 1: Find product IDs that match the search name
            const matchingProducts = await Product.find({
                name: { $regex: search, $options: "i" }
            }).select('_id');
            const productIds = matchingProducts.map(p => p._id);

            // Step 2: Search by Order ID OR containing any matching Product ID
            query = {
                $or: [
                    { orderId: { $regex: search, $options: "i" } },
                    { "orderedItems.product": { $in: productIds } }
                ]
            };
        }

        const { orders, totalPages, totalOrders } = await orderService.getOrders(userId, query, page, limit);

        res.render("user/orders/orders", {
            orders,
            page,
            totalPages,
            totalOrders,
            search,
            path: "/user/orders"
        });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).redirect("/user/profile");
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const userId = req.session.user;
        const orderId = req.params.orderId;

        const order = await orderService.getOrderById(orderId, userId);
        if (!order) {
            return res.status(404).redirect("/user/orders");
        }

        res.render("user/orders/orderDetails", {
            order,
            path: "/user/orders"
        });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).redirect("/user/orders");
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const orderId = req.params.orderId;
        const { reason } = req.body;

        await orderService.cancelOrder(orderId, userId, reason);

        res.status(200).json({ success: true, message: "Order cancelled successfully." });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const returnOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const orderId = req.params.orderId;
        const { reason } = req.body;

        await orderService.returnOrder(orderId, userId, reason);

        res.status(200).json({ success: true, message: "Return request submitted." });
    } catch (error) {
        console.error("Error returning order:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const downloadInvoice = async (req, res) => {
    try {
        const userId = req.session.user;
        const orderId = req.params.orderId;

        const order = await orderService.getOrderById(orderId, userId);
        if (!order || order.status !== 'Delivered') {
            return res.status(404).send("Invoice not available.");
        }

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId}.pdf`);

        // Use the utility to generate and stream the PDF
        generateInvoice(res, order);

    } catch (error) {
        console.error("Invoice Download Error:", error);
        res.status(500).send("Failed to generate invoice.");
    }
};
