import * as OrderService from "../../services/admin/ordersService.js";
import Order from "../../models/ordersModel.js";
import { generateInvoice } from "../../utils/invoiceGenerator.js";
import { ADMIN_ORDER_MESSAGES } from "../../constants/messages.js";
import { STATUS_CODES } from "../../constants/statusCode.js";


export const loadOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const { orders, totalPages, totalOrders } = await OrderService.getAllOrders(req.query, page, limit);

        const totalOrdersCount = await Order.countDocuments();
        const pendingOrdersCount = await Order.countDocuments({ status: "Pending" });
        const canceledOrdersCount = await Order.countDocuments({ status: "Cancelled" });
        const completedOrdersCount = await Order.countDocuments({ status: "Delivered" });

        res.render("admin/orders/orders", {
            orders,
            page,
            totalPages,
            totalOrders,
            limit,
            activePage: "orders",
            filters: req.query,
            totalOrdersCount,
            pendingOrdersCount,
            canceledOrdersCount,
            completedOrdersCount
        });
    } catch (error) {
        console.error("Error loading admin orders:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render("admin/error", { message: ADMIN_ORDER_MESSAGES.LOAD_FAILED });
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await OrderService.getOrderById(orderId);
        if (!order) {
            return res.status(STATUS_CODES.NOT_FOUND).render("admin/error", { message: ADMIN_ORDER_MESSAGES.NOT_FOUND });
        }
        res.render("admin/orders/orderDetails", { order, activePage: "orders" });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render("admin/error", { message: ADMIN_ORDER_MESSAGES.FETCH_FAILED });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
        if (updatedOrder) {
            res.json({ success: true, message: ADMIN_ORDER_MESSAGES.STATUS_UPDATED });
        } else {
            res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: ADMIN_ORDER_MESSAGES.STATUS_UPDATE_FAILED });
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message || ADMIN_ORDER_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

export const updateOrderItemStatus = async (req, res) => {
    try {
        const { orderId, itemId, status } = req.body;
        const updatedOrder = await OrderService.updateOrderItemStatus(orderId, itemId, status);
        if (updatedOrder) {
            res.json({ success: true, message: ADMIN_ORDER_MESSAGES.ITEM_STATUS_UPDATED });
        } else {
            res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: ADMIN_ORDER_MESSAGES.ITEM_STATUS_UPDATE_FAILED });
        }
    } catch (error) {
        console.error("Error updating order item status:", error);
        res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message || ADMIN_ORDER_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

export const loadReturns = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const { orders, totalPages, totalOrders } = await OrderService.getReturnRequests(req.query, page, limit);

        res.render("admin/orders/returns", {
            orders,
            page,
            totalPages,
            totalOrders,
            limit,
            activePage: "returns",
            search:req.query.search || ""
        });
    } catch (error) {
        console.error("Error loading return requests:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render("admin/error", { message: ADMIN_ORDER_MESSAGES.RETURN_LOAD_FAILED });
    }
};

export const downloadInvoiceAdmin = async (req, res) => {

    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId)
            .populate("userId")
            .populate("orderedItems.product");

        if (!order) {
            return res.status(STATUS_CODES.NOT_FOUND).send(ADMIN_ORDER_MESSAGES.INVOICE_NOT_AVAILABLE);
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=invoice-${order.orderId}.pdf`
        );
        generateInvoice(res, order);
    } catch (error) {
        console.error("Admin Invoice Download Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(ADMIN_ORDER_MESSAGES.INVOICE_FAILED);
    }
};