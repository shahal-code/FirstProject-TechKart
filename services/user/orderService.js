import mongoose from "mongoose";
import Order from "../../models/ordersModel.js";
import Cart from "../../models/cartModel.js";
import Product from "../../models/productModel.js";
import CouponService from "./couponService.js";
import { applyOffers } from "./productServices.js";
import * as walletService from "./walletService.js";

class OrderService {
    async createOrder(userId, address, paymentMethod, paymentFailed = false, appliedCoupon = null) {
        // Fetch Cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) throw new Error("Your cart is empty.");

        const productsToApply = cart.items.map(item => item.productId).filter(Boolean);
        if (productsToApply.length > 0) {
            await applyOffers(productsToApply);
        }

        // Validate Stock and Prepare Items
        let subtotal = 0;
        const orderedItems = cart.items.map(item => {
            const product = item.productId;
            if (!product || product.is_blocked || product.is_unlisted) {
                throw new Error(`Product ${product ? product.name : 'Unknown'} is no longer available.`);
            }

            const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
            if (!variant || variant.is_blocked) throw new Error(`Specific variant for ${product.name} is no longer available.`);
            if (variant.stock < item.quantity) throw new Error(`Not enough stock for ${product.name}`);

            subtotal += variant.price * item.quantity;
            return {
                product: item.productId._id,
                variantId: item.variantId,
                quantity: item.quantity,
                price: variant.price
            };
        });

        // Final Calculations
        const tax = subtotal * 0.18;
        let finalAmount = subtotal + tax;
        let discount = 0;

        if (appliedCoupon && finalAmount >= appliedCoupon.minPurchaseAmount) {
            discount = CouponService.calculateDiscount(appliedCoupon, finalAmount);
            finalAmount = finalAmount - discount;
            if (finalAmount < 0) finalAmount = 0;
        }

        let paymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Paid';
        if (paymentFailed) {
            paymentStatus = 'Failed';
        }

        // Wallet Balance Check
        if (paymentMethod === 'Wallet' && !paymentFailed) {
            const wallet = await walletService.getOrCreateWallet(userId);
            if (wallet.balance < finalAmount) {
                throw new Error("Insufficient wallet balance.");
            }
        }

        //  Save Order
        const order = new Order({
            userId,
            orderId: `ORD-${Date.now().toString().slice(-8)}`, // Simple unique ID
            orderedItems,
            totalPrice: subtotal,
            discount,
            finalAmount,
            shippingAddress: {
                fullname: address.fullname,
                phone: address.phone,
                line1: address.line1,
                line2: address.line2,
                city: address.city,
                state: address.state,
                postal_code: address.postal_code
            },
            paymentMethod,
            status: 'Pending',
            paymentStatus
        });

        await order.save();

        if (appliedCoupon) {
            await CouponService.markCouponAsUsed(appliedCoupon._id, userId);
        }

        // Wallet Deduction
        if (paymentMethod === 'Wallet' && !paymentFailed) {
            await walletService.debitWallet(
                userId,
                finalAmount,
                `Payment for order ${order.orderId}`,
                order.orderId
            );
        }

        // Atomic Stock Update
        for (const item of cart.items) {
            await Product.updateOne(
                { _id: item.productId._id, "variants._id": item.variantId },
                { $inc: { "variants.$.stock": -item.quantity } }
            );
        }

        //  Clear Cart
        await Cart.deleteOne({ userId });

        return order;
    }

    async getOrders(userId, queryParams = {}, page = 1, limit = 10) {
        const { search } = queryParams;
        const skip = (page - 1) * limit;

        let query = { userId };

        if (search) {
            // Find product IDs that match the search name
            const matchingProducts = await Product.find({
                name: { $regex: search, $options: "i" }
            }).select('_id');
            const productIds = matchingProducts.map(p => p._id);

            query.$or = [
                { orderId: { $regex: search, $options: "i" } },
                { "orderedItems.product": { $in: productIds } }
            ];
        }

        const orders = await Order.find(query)
            .populate('orderedItems.product')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);

        return { orders, totalPages, totalOrders };
    }

    async getOrderById(orderId, userId) {
        return await Order.findOne({ _id: orderId, userId }).populate('orderedItems.product');
    }

    async getOrderByDisplayId(displayId, userId) {
        return await Order.findOne({ orderId: displayId, userId }).populate('orderedItems.product');
    }

    async updatePaymentStatus(displayId, userId, status) {
        const order = await Order.findOne({ orderId: displayId, userId });
        if (!order) throw new Error("Order not found");
        order.paymentStatus = status;
        await order.save();
        return order;
    }

    async cancelOrder(orderId, userId, reason) {
        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) throw new Error("Order not found.");

        const allowedStatus = ['Pending', 'Processing', 'Shipped'];
        if (!allowedStatus.includes(order.status)) {
            throw new Error(`Order cannot be cancelled. Current status: ${order.status}`);
        }

        // Calculate refund
        if (order.paymentStatus === 'Paid' || order.paymentStatus === 'Partially Refunded') {
            let refundAmount = 0;
            const allActive = order.orderedItems.every(i => i.status !== 'Cancelled' && i.status !== 'Returned');
            
            if (allActive) {
                // If cancelling the whole untouched order, refund the exact final amount (accounts for discounts)
                refundAmount = order.finalAmount;
            } else {
                // If partially cancelled before, refund only the remaining active items
                order.orderedItems.forEach(item => {
                    if (item.status !== 'Cancelled' && item.status !== 'Returned') {
                        refundAmount += (item.price * item.quantity);
                    }
                });
            }

            if (refundAmount > 0) {
                await walletService.creditWallet(
                    userId,
                    refundAmount,
                    `Refund for cancelled order ${order.orderId}`,
                    order.orderId
                );
            }
            order.paymentStatus = 'Refunded';
        }

        order.status = 'Cancelled';
        order.cancellationReason = reason;

        // Revert Stock and mark items
        for (const item of order.orderedItems) {
            if (item.status !== 'Cancelled' && item.status !== 'Returned') {
                item.status = 'Cancelled';
                item.cancellationReason = reason;
                await Product.updateOne(
                    { _id: item.product, "variants._id": new mongoose.Types.ObjectId(item.variantId) },
                    { $inc: { "variants.$.stock": item.quantity } }
                );
            }
        }

        await order.save();
        return order;
    }

    async returnOrder(orderId, userId, reason) {
        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) throw new Error("Order not found.");

        if (order.status !== 'Delivered') {
            throw new Error("Only delivered orders can be returned.");
        }

        order.status = 'Return Request';
        order.returnReason = reason;

        // Also update all individual items that are delivered
        order.orderedItems.forEach(item => {
            if (item.status === 'Delivered') {
                item.status = 'Return Request';
                item.returnReason = reason;
            }
        });

        await order.save();
        return order;
    }

    async cancelOrderItem(orderId, itemId, userId, reason) {
        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) throw new Error("Order not found.");

        const item = order.orderedItems.id(itemId);
        if (!item) throw new Error("Item not found in order.");

        const allowedStatus = ['Pending', 'Processing', 'Shipped', 'Out for Delivery'];
        if (!allowedStatus.includes(item.status)) {
            throw new Error(`Item cannot be cancelled. Current status: ${item.status}`);
        }

        item.status = 'Cancelled';
        item.cancellationReason = reason;

        // Refund for the item
        if (order.paymentStatus === 'Paid' || order.paymentStatus === 'Partially Refunded') {
            const refundAmount = item.price * item.quantity;
            await walletService.creditWallet(
                userId,
                refundAmount,
                `Refund for cancelled item in order ${order.orderId}`,
                order.orderId
            );
            order.paymentStatus = 'Partially Refunded';
        }

        // Revert Stock
        await Product.updateOne(
            { _id: item.product, "variants._id": new mongoose.Types.ObjectId(item.variantId) },
            { $inc: { "variants.$.stock": item.quantity } }
        );

        // Update overall order status if all items are cancelled
        const allCancelled = order.orderedItems.every(i => i.status === 'Cancelled');
        if (allCancelled) {
            order.status = 'Cancelled';
            if (order.paymentStatus === 'Partially Refunded') {
                order.paymentStatus = 'Refunded';
            }
        }

        await order.save();
        return order;
    }

    async returnOrderItem(orderId, itemId, userId, reason) {
        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) throw new Error("Order not found.");

        const item = order.orderedItems.id(itemId);
        if (!item) throw new Error("Item not found in order.");

        if (item.status !== 'Delivered') {
            throw new Error("Only delivered items can be returned.");
        }

        item.status = 'Return Request';
        item.returnReason = reason;

        // Update overall order status if all items are returned
        const allReturned = order.orderedItems.every(i => i.status === 'Return Request' || i.status === 'Returned' || i.status === 'Cancelled');
        if (allReturned) {
            order.status = 'Return Request';
        }

        await order.save();
        return order;
    }
}

export default new OrderService();
