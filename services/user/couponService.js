import Coupon from "../../models/couponModel.js";

class CouponService {
    /**
     * Calculate the discount amount for a given total
     */
    calculateDiscount(coupon, total) {
        if (!coupon) return 0;
        
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (total * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else {
            discount = coupon.discountValue;
        }
        
        return discount;
    }

    /**
     * Validates a coupon code against business rules
     */
    async validateCoupon(code, userId, cartTotal) {
        if (!code) {
            throw new Error("Please enter a coupon code.");
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        
        if (!coupon) {
            throw new Error("Invalid or expired coupon.");
        }

        if (new Date() > coupon.expirationDate) {
            throw new Error("This coupon has expired.");
        }

        if (coupon.usedBy.includes(userId)) {
            throw new Error("You have already used this coupon.");
        }

        if (cartTotal < coupon.minPurchaseAmount) {
            throw new Error(`Minimum purchase of ₹${coupon.minPurchaseAmount} required.`);
        }

        return coupon;
    }

    /**
     * Mark a coupon as used by a specific user
     */
    async markCouponAsUsed(couponId, userId) {
        if (!couponId || !userId) return;
        await Coupon.updateOne(
            { _id: couponId },
            { $push: { usedBy: userId } }
        );
    }
}

export default new CouponService();
