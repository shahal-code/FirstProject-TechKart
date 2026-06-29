import Coupon from "../../models/couponModel.js";
import CouponService from "../../services/admin/couponService.js";
import { COUPON_MESSAGES } from "../../constants/messages.js";
import { STATUS_CODES } from "../../constants/statusCode.js";


/**
 * Load Coupons Page
 */
export const loadCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        const { totalCoupons, activeCoupons, expiredCoupons } = await CouponService.getCouponStats();

        res.render("admin/coupons/coupons", { coupons, totalCoupons, activeCoupons, expiredCoupons, activePage: "coupons" });
    } catch (error) {
        console.error("Load Coupons Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(COUPON_MESSAGES.SERVER_ERROR);
    }
};

/**
 * Render Add Coupon Page
 */
export const getAddCouponPage = (req, res) => {
    res.render("admin/coupons/add-coupon", { activePage: "coupons" });
};

/**
 * Render Edit Coupon Page
 */
export const getEditCouponPage = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.redirect('/admin/coupons');
        res.render("admin/coupons/edit-coupon", { coupon, activePage: "coupons" });
    } catch (error) {
        console.error("Edit Coupon Page Error:", error);
        res.redirect('/admin/coupons');
    }
};

/**
 * Create Coupon
 */
export const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, expirationDate } = req.body;

        if (!code || !discountType || !discountValue || !expirationDate) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: COUPON_MESSAGES.REQUIRED_FIELDS_MISSING });
        }

        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: COUPON_MESSAGES.CODE_EXISTS });
        }

        const coupon = new Coupon({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minPurchaseAmount: minPurchaseAmount || 0,
            maxDiscountAmount: maxDiscountAmount || null,
            expirationDate: new Date(expirationDate),
            isActive: true
        });

        await coupon.save();
        res.json({ success: true, message: COUPON_MESSAGES.CREATED });
    } catch (error) {
        console.error("Create Coupon Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: COUPON_MESSAGES.CREATE_FAILED });
    }
};

/**
 * Update Coupon
 */
export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, expirationDate } = req.body;

        if (!code || !discountType || !discountValue || !expirationDate) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: COUPON_MESSAGES.REQUIRED_FIELDS_MISSING });
        }

        // Check if another coupon already uses this code
        const existing = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: id } });
        if (existing) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: COUPON_MESSAGES.CODE_EXISTS_OTHER });
        }

        await Coupon.findByIdAndUpdate(id, {
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minPurchaseAmount: minPurchaseAmount || 0,
            maxDiscountAmount: maxDiscountAmount || null,
            expirationDate: new Date(expirationDate)
        });

        res.json({ success: true, message: COUPON_MESSAGES.UPDATED });
    } catch (error) {
        console.error("Update Coupon Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: COUPON_MESSAGES.UPDATE_FAILED });
    }
};

/**
 * Toggle Coupon Active Status
 */
export const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: COUPON_MESSAGES.NOT_FOUND });
        }
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        res.json({ success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully.` });
    } catch (error) {
        console.error("Toggle Coupon Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: COUPON_MESSAGES.STATUS_UPDATE_FAILED });
    }
};

/**
 * Delete Coupon
 */
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await Coupon.findByIdAndDelete(id);
        res.json({ success: true, message: COUPON_MESSAGES.DELETED });
    } catch (error) {
        console.error("Delete Coupon Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: COUPON_MESSAGES.DELETE_FAILED });
    }
};
