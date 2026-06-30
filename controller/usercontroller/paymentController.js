import Cart from "../../models/cartModel.js";
import * as paymentService from "../../services/user/paymentServices.js";
import OrderService from "../../services/user/orderService.js";
import { PAYMENT_MESSAGES } from "../../constants/messages.js";
import { STATUS_CODES } from "../../constants/statusCode.js";


export const createOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const userId = req.session.user;

    if (!amount) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: PAYMENT_MESSAGES.AMOUNT_REQUIRED,
      });
    }

    if (orderId) {
      const existingOrder = await OrderService.getOrderByDisplayId(orderId, userId);
      if (!existingOrder) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: PAYMENT_MESSAGES.ORDER_NOT_FOUND });
      }
      if (existingOrder.status !== 'Pending') {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: PAYMENT_MESSAGES.RETRY_PENDING_FAILED });
      }
      if (existingOrder.paymentStatus !== 'Failed' && !(existingOrder.paymentStatus === 'Pending' && existingOrder.inventoryProcessed === false)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: PAYMENT_MESSAGES.RETRY_NOT_ALLOWED });
      }
      if (Number(existingOrder.finalAmount) !== Number(amount)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: PAYMENT_MESSAGES.AMOUNT_MISMATCH });
      }
    } else {
      // Pre-flight check: validate the cart and recalculate price
      try {
        const { finalAmount } = await OrderService.validateCartAndBuildOrder(userId, req.session.appliedCoupon);

        const expected = Math.round(Number(amount));
        const final = Math.round(Number(finalAmount));
        if (expected !== final) {
          let message = PAYMENT_MESSAGES.PRICE_CHANGE_INCREASE;
          if (final < expected) {
            message = PAYMENT_MESSAGES.PRICE_CHANGE_DECREASE;
          }
          return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message });
        }
      } catch (validationError) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: validationError.message || "Cart validation failed. Please refresh the page." });
      }
    }

    const order = await paymentService.createRazorpayOrder(amount);

    res.status(STATUS_CODES.OK).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: PAYMENT_MESSAGES.DETAILS_REQUIRED,
      });
    }

    const isValid = paymentService.verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: PAYMENT_MESSAGES.INVALID_SIGNATURE,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: PAYMENT_MESSAGES.VERIFIED,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};

