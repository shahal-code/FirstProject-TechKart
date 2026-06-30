import Coupon from "../../models/couponModel.js";
import Cart from "../../models/cartModel.js";
import { applyOffers } from "./productServices.js";
import { COUPON_MESSAGES } from "../../constants/messages.js";


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
     * Compute the cart total (+ tax) server-side for a given user.
     * NEVER trust the client-supplied cartTotal — always call this instead.
     */
    async getServerCartTotal(userId) {
        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            populate: { path: 'category_id' }
        });

        if (!cart || cart.items.length === 0) return 0;

        const productsToApply = cart.items.map(i => i.productId).filter(Boolean);
        if (productsToApply.length > 0) {
            await applyOffers(productsToApply);
        }

        let subtotal = 0;
        cart.items.forEach(item => {
            const product = item.productId;
            const category = product?.category_id;
            if (!product || product.is_blocked || (category && category.is_blocked)) return;

            const variant = product.variants?.find(v => v._id.toString() === item.variantId.toString());
            if (variant) {
                subtotal += variant.price * item.quantity;
            }
        });

        const tax = subtotal * 0.18;
        return subtotal + tax; // total with tax
    }

    /**
     * Validates a coupon code against business rules.
     * cartTotal is computed SERVER-SIDE — the caller must pass the result of
     * getServerCartTotal(), NOT a value from req.body.
     */
    async validateCoupon(code, userId, serverCartTotal) {
        if (!code) {
            throw new Error(COUPON_MESSAGES.PLEASE_ENTER_A_COUPON_CODE);
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            throw new Error(COUPON_MESSAGES.COUPON_IS_NOT_AVAILABLE);
        }

        if (new Date() > coupon.expirationDate) {
            throw new Error(COUPON_MESSAGES.THIS_COUPON_HAS_EXPIRED);
        }

        const alreadyUsed = coupon.usedBy.some(
            usedUserId => usedUserId.toString() === userId.toString()
        );
        if (alreadyUsed) {
            throw new Error(COUPON_MESSAGES.YOU_HAVE_ALREADY_USED_THIS_COUPON);
        }

        const total = Number(serverCartTotal) || 0;
        if (total < coupon.minPurchaseAmount) {
            throw new Error(`Minimum purchase of ₹${coupon.minPurchaseAmount} required.`);
        }

        return coupon;
    }

    /**
     * Re-validate an already-applied coupon at order-placement time.
     * Checks expiry, usage, and that the CURRENT server-side cart total still
     * meets the minimum purchase requirement.  Throws on any violation.
     */
    async reValidateCoupon(appliedCoupon, userId, serverCartTotal) {
        if (!appliedCoupon) return null;

        // Re-fetch from DB in case coupon was deactivated / already used
        const coupon = await Coupon.findOne({ _id: appliedCoupon._id, isActive: true });
        if (!coupon) {
            throw new Error(COUPON_MESSAGES.THE_APPLIED_COUPON_IS_NO_LONGER_VAL);
        }

        if (new Date() > coupon.expirationDate) {
            throw new Error(COUPON_MESSAGES.THE_APPLIED_COUPON_HAS_EXPIRED_PLEA);
        }

        const alreadyUsed = coupon.usedBy.some(
            usedUserId => usedUserId.toString() === userId.toString()
        );
        if (alreadyUsed) {
            throw new Error(COUPON_MESSAGES.THIS_COUPON_HAS_ALREADY_BEEN_USED);
        }

        const total = Number(serverCartTotal) || 0;
        if (total < coupon.minPurchaseAmount) {
            throw new Error(
                `Your cart total (₹${total.toFixed(2)}) no longer meets the minimum ` +
                `purchase of ₹${coupon.minPurchaseAmount} required for coupon "${coupon.code}". ` +
                `Please remove the coupon or add more items.`
            );
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
            const alreadyUsed = (coupon.usedBy || []).some(
                usedUserId => usedUserId.toString() === userId.toString()
            );
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
