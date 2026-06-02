import crypto from "crypto";
import razorpay from "../../config/razorpay.js";

export const createRazorpayOrder = async (amount) => {
  const amountInPaise = Math.round(Number(amount) * 100);

  if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
    throw new Error("Invalid payment amount");
  }

  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  return await razorpay.orders.create(options);
};

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
};
