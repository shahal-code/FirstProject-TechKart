import Coupon from "../../models/couponModel.js";

/**
 * Load Coupons Page
 */
export const loadCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.render("admin/coupons/coupons", {
            coupons,
            activePage: "coupons"
        });
    } catch (error) {
        console.error("Load Coupons Error:", error);
        res.status(500).send("Server Error");
    }
};
