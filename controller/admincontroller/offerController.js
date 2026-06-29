
import Offer from "../../models/offerModel.js";
import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import OfferService from "../../services/admin/offerService.js";
import { OFFER_MESSAGES } from "../../constants/messages.js";

const ADMIN_OFFER_TYPES = ["product", "category"];

/**
 * Load Offers Page
 */
export const loadOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ offerType: { $in: ADMIN_OFFER_TYPES } }).sort({ createdAt: -1 });

        // Count statistics from service
        const { totalOffers, activeOffers, expiredOffers } = await OfferService.getOfferStats();

        res.render("admin/offers/offers", { offers, totalOffers, activeOffers, expiredOffers, activePage: "offers" });
    } catch (error) {
        console.error("Load Offers Error:", error);
        res.status(500).send("Server Error");
    }
};

/**
 * Render Add Offer Page
 */
export const getAddOfferPage = async (req, res) => {
    try {
        const products = await Product.find({ is_unlisted: false, is_blocked: false }).select('name _id');
        const categories = await Category.find({ is_blocked: false }).select('name _id');
        res.render("admin/offers/add-offer", { products, categories, activePage: "offers" });
    } catch (error) {
        console.error("Load Add Offer Page Error:", error);
        res.status(500).send(OFFER_MESSAGES.SERVER_ERROR);
    }
};

/**
 * Render Edit Offer Page
 */
export const getEditOfferPage = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.redirect('/admin/offers');
        if (!ADMIN_OFFER_TYPES.includes(offer.offerType)) return res.redirect('/admin/offers');

        const products = await Product.find({ is_unlisted: false, is_blocked: false }).select('name _id');
        const categories = await Category.find({ is_blocked: false }).select('name _id');

        res.render("admin/offers/edit-offer", { offer, products, categories, activePage: "offers" });
    } catch (error) {
        console.error("Edit Offer Page Error:", error);
        res.redirect('/admin/offers');
    }
};

/**
 * Create Offer
 */
export const createOffer = async (req, res) => {
    try {
        const { name, description, offerType, discountType, discountValue, maxDiscountAmount, applicableTo, startDate, endDate } = req.body;

        if (!name || !offerType || !discountType || !discountValue || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: OFFER_MESSAGES.REQUIRED_FIELDS_MISSING });
        }

        if (!ADMIN_OFFER_TYPES.includes(offerType)) {
            return res.status(400).json({ success: false, message: OFFER_MESSAGES.ADMIN_ONLY });
        }

        if (!applicableTo) {
            return res.status(400).json({ success: false, message: OFFER_MESSAGES.SELECT_APPLICABLE_ITEM });
        }

        const offerData = {
            name,
            description,
            offerType,
            discountType,
            discountValue,
            maxDiscountAmount: maxDiscountAmount || null,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            isActive: true
        };

        if (offerType === 'product') {
            offerData.applicableTo = applicableTo;
            offerData.applicableModel = 'Product';
        } else if (offerType === 'category') {
            offerData.applicableTo = applicableTo;
            offerData.applicableModel = 'Category';
        }

        const offer = new Offer(offerData);
        await offer.save();

        res.json({ success: true, message: OFFER_MESSAGES.CREATED });
    } catch (error) {
        console.error("Create Offer Error:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            return res.status(400).json({ success: false, message: `A duplicate value was detected (${field}). Please use a unique offer name.` });
        }
        res.status(500).json({ success: false, message: OFFER_MESSAGES.CREATE_FAILED });
    }
};

/**
 * Update Offer
 */
export const updateOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, discountType, discountValue, maxDiscountAmount, applicableTo, startDate, endDate } = req.body;

        if (!name || !discountType || !discountValue || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: OFFER_MESSAGES.REQUIRED_FIELDS_MISSING });
        }

        const existingOffer = await Offer.findById(id).select("offerType");
        if (!existingOffer) {
            return res.status(404).json({ success: false, message: OFFER_MESSAGES.NOT_FOUND });
        }

        const offerType = existingOffer.offerType;
        if (!ADMIN_OFFER_TYPES.includes(offerType)) {
            return res.status(400).json({ success: false, message: OFFER_MESSAGES.REFERRAL_NOT_ALLOWED });
        }

        if (!applicableTo) {
            return res.status(400).json({ success: false, message: OFFER_MESSAGES.SELECT_APPLICABLE_ITEM });
        }

        const offerData = {
            name,
            description,
            discountType,
            discountValue,
            maxDiscountAmount: maxDiscountAmount || null,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        };

        if (offerType === 'product') {
            offerData.applicableTo = applicableTo;
            offerData.applicableModel = 'Product';
        } else if (offerType === 'category') {
            offerData.applicableTo = applicableTo;
            offerData.applicableModel = 'Category';
        }

        await Offer.findByIdAndUpdate(id, offerData);

        res.json({ success: true, message: OFFER_MESSAGES.UPDATED });
    } catch (error) {
        console.error("Update Offer Error:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            return res.status(400).json({ success: false, message: `A duplicate value was detected (${field}). Please use a unique offer name.` });
        }
        res.status(500).json({ success: false, message: OFFER_MESSAGES.UPDATE_FAILED });
    }
};

/**
 * Toggle Offer Active Status
 */
export const toggleOfferStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findById(id);
        if (!offer) {
            return res.status(404).json({ success: false, message: OFFER_MESSAGES.NOT_FOUND });
        }
        if (!ADMIN_OFFER_TYPES.includes(offer.offerType)) {
            return res.status(400).json({ success: false, message: OFFER_MESSAGES.REFERRAL_NOT_ALLOWED });
        }
        offer.isActive = !offer.isActive;
        await offer.save();
        res.json({ success: true, message: `Offer ${offer.isActive ? 'activated' : 'deactivated'} successfully.` });
    } catch (error) {
        console.error("Toggle Offer Error:", error);
        res.status(500).json({ success: false, message: OFFER_MESSAGES.STATUS_UPDATE_FAILED });
    }
};

/**
 * Delete Offer
 */
export const deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findById(id).select("offerType");
        if (!offer) {
            return res.status(404).json({ success: false, message: OFFER_MESSAGES.NOT_FOUND });
        }
        if (!ADMIN_OFFER_TYPES.includes(offer.offerType)) {
            return res.status(400).json({ success: false, message: OFFER_MESSAGES.REFERRAL_NOT_ALLOWED });
        }

        await Offer.findByIdAndDelete(id);
        res.json({ success: true, message: OFFER_MESSAGES.DELETED });
    } catch (error) {
        console.error("Delete Offer Error:", error);
        res.status(500).json({ success: false, message: OFFER_MESSAGES.DELETE_FAILED });
    }
};
