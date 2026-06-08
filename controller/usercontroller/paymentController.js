import Cart from "../../models/cartModel.js";
import * as paymentService from "../../services/user/paymentServices.js";
import OrderService from "../../services/user/orderService.js";

export const createOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const userId = req.session.user;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    if (orderId) {
        const existingOrder = await OrderService.getOrderByDisplayId(orderId, userId);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        if (existingOrder.status !== 'Pending') {
            return res.status(400).json({ success: false, message: "Only pending failed orders can be retried." });
        }
        if (existingOrder.paymentStatus !== 'Failed' && !(existingOrder.paymentStatus === 'Pending' && existingOrder.inventoryProcessed === false)) {
            return res.status(400).json({ success: false, message: "This order cannot be retried." });
        }
        if (Number(existingOrder.finalAmount) !== Number(amount)) {
            return res.status(400).json({ success: false, message: "Order amount mismatch. Please reload and try again." });
        }
    } else {
        // Pre-flight check: validate the cart is still valid before creating a Razorpay order
        const cart = await Cart.findOne({ userId }).populate({ path: 'items.productId', populate: { path: 'category_id' } });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty." });
        }

        for (const item of cart.items) {
            const product = item.productId;
            const category = product?.category_id;

            const isBlocked = !product || product.is_blocked || product.is_unlisted || (category && category.is_blocked);
            if (isBlocked) {
                return res.status(400).json({ success: false, message: `Product ${product ? product.name : 'Unknown'} is no longer available. Please reload the page.` });
            }

            const variant = product.variants?.find(v => v._id.toString() === item.variantId.toString());
            if (!variant || variant.is_blocked) {
                return res.status(400).json({ success: false, message: `A specific variant for ${product ? product.name : 'Unknown'} is no longer available. Please reload the page.` });
            }

            if (variant.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Not enough stock for ${product ? product.name : 'Unknown'}. Please reload the page.` });
            }
        }
    }

    const order = await paymentService.createRazorpayOrder(amount);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    const isValid = paymentService.verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};
