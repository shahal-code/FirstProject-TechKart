import Review from "../../models/reviewModel.js";
import Product from "../../models/productModel.js";
import { REVIEW_MESSAGES } from "../../constants/messages.js";

export const addReview = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.session.user; // Assuming userAuth sets req.session.user

        if (!userId) {
            return res.status(401).json({ success: false, message: REVIEW_MESSAGES.LOGIN_REQUIRED });
        }

        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: REVIEW_MESSAGES.FIELDS_REQUIRED });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: REVIEW_MESSAGES.NOT_FOUND });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ user: userId, product: productId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: REVIEW_MESSAGES.ALREADY_REVIEWED });
        }

        const review = new Review({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment: comment.trim()
        });

        await review.save();

        res.status(201).json({ success: true, message: REVIEW_MESSAGES.ADDED, review });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ success: false, message: REVIEW_MESSAGES.ERROR_SUBMITTING });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id: productId, reviewId } = req.params;
        const userId = req.session.user;

        if (!userId) {
            return res.status(401).json({ success: false, message: REVIEW_MESSAGES.LOGIN_REQUIRED_DELETE });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: REVIEW_MESSAGES.REVIEW_NOT_FOUND });
        }

        if (String(review.user) !== String(userId)) {
            return res.status(403).json({ success: false, message: REVIEW_MESSAGES.NOT_AUTHORIZED });
        }

        await Review.findByIdAndDelete(reviewId);
        res.status(200).json({ success: true, message: REVIEW_MESSAGES.DELETED });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ success: false, message: REVIEW_MESSAGES.ERROR_DELETING });
    }
};

