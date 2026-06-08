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
            throw new Error("Coupon is not available.");
        }

        if (new Date() > coupon.expirationDate) {
            throw new Error("This coupon has expired.");
        }

        const alreadyUsed = coupon.usedBy.some(usedUserId => usedUserId.toString() === userId.toString());
        if (alreadyUsed) {
            throw new Error("You have already used this coupon.");
        }

        const validatedCartTotal = Number(cartTotal) || 0;
        if (validatedCartTotal < coupon.minPurchaseAmount) {
            throw new Error(`Minimum purchase of Rs.${coupon.minPurchaseAmount} required.`);
        }

        return coupon;
    }

    /**
     * Get all active coupons applicable to the current user and cart total
     */
    async getApplicableCoupons(userId, cartTotal) {
        const validatedCartTotal = Number(cartTotal) || 0;
        const now = new Date();

        const coupons = await Coupon.find({
            isActive: true,
            expirationDate: { $gt: now }
        }).sort({ createdAt: -1 }).lean();

        return coupons.filter(coupon => {
            const alreadyUsed = (coupon.usedBy || []).some(usedUserId => usedUserId.toString() === userId.toString());
            if (alreadyUsed) return false;
            return validatedCartTotal >= (coupon.minPurchaseAmount || 0);
        });
    }

    /**
     * Mark a coupon as used by a specific user
     */
    async markCouponAsUsed(couponId, userId) {
        if (!couponId || !userId) return;
        await Coupon.updateOne(
            { _id: couponId },
            { $addToSet: { usedBy: userId } }
        );
    }
}

export default new CouponService();
