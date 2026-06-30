import Review from "../../models/reviewModel.js";
import Product from "../../models/productModel.js";
import { REVIEW_MESSAGES } from "../../constants/messages.js";
import { STATUS_CODES } from "../../constants/statusCode.js";


export const addReview = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.session.user; // Assuming userAuth sets req.session.user

        if (!userId) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ success: false, message: REVIEW_MESSAGES.LOGIN_REQUIRED });
        }

        if (!rating || !comment) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: REVIEW_MESSAGES.FIELDS_REQUIRED });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: REVIEW_MESSAGES.NOT_FOUND });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ user: userId, product: productId });
        if (existingReview) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: REVIEW_MESSAGES.ALREADY_REVIEWED });
        }

        const review = new Review({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment: comment.trim()
        });

        await review.save();

        res.status(STATUS_CODES.CREATED).json({ success: true, message: REVIEW_MESSAGES.ADDED, review });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: REVIEW_MESSAGES.ERROR_SUBMITTING });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id: productId, reviewId } = req.params;
        const userId = req.session.user;

        if (!userId) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ success: false, message: REVIEW_MESSAGES.LOGIN_REQUIRED_DELETE });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: REVIEW_MESSAGES.REVIEW_NOT_FOUND });
        }

        if (String(review.user) !== String(userId)) {
            return res.status(STATUS_CODES.FORBIDDEN).json({ success: false, message: REVIEW_MESSAGES.NOT_AUTHORIZED });
        }

        await Review.findByIdAndDelete(reviewId);
        res.status(STATUS_CODES.OK).json({ success: true, message: REVIEW_MESSAGES.DELETED });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: REVIEW_MESSAGES.ERROR_DELETING });
    }
};

