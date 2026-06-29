// ============================================================
//  constants/messages.js
//  Central source of truth for all response / UI messages.
//  Import only what you need per controller.
// ============================================================

// ─── AUTH ────────────────────────────────────────────────────
export const AUTH_MESSAGES = {
    // OTP
    OTP_EXPIRED:             "OTP has expired. Please resend.",
    OTP_INVALID:             "Invalid OTP. Please try again.",
    OTP_VERIFICATION_FAILED: "Verification failed. Please try again.",
    OTP_RESENT:              "OTP resent successfully",
    OTP_RESEND_FAILED:       "Failed to resend OTP",
    SESSION_EXPIRED:         "Session expired",

    // Password
    PASSWORDS_DO_NOT_MATCH:  "Passwords do not match",
    PASSWORD_RESET_FAILED:   "Password reset failed. Please try again.",

    // Server
    INTERNAL_SERVER_ERROR:   "Internal Server Error",
};

// ─── CART ────────────────────────────────────────────────────
export const CART_MESSAGES = {
    LOGIN_REQUIRED:          "Please login to add items to cart",
    ITEM_ADDED:              "Item added to cart successfully",
    QUANTITY_UPDATED:        "Quantity updated",
    ITEM_REMOVED:            "Item removed from cart",
    VALIDATION_FAILED:       "Cart validation failed.",
    LOAD_FAILED:             "Failed to load shopping cart",

    // Price change alerts
    PRICE_UPDATED_TITLE:     "Price Updated",
    PRICE_UPDATED_MSG:       "An offer has expired or prices have changed. The cart will be updated to reflect the new prices.",
    OFFER_APPLIED_TITLE:     "Offer Applied!",
    OFFER_APPLIED_MSG:       "Great news! A new offer just became available for your items. Your cart total has decreased!",
};

// ─── WISHLIST ────────────────────────────────────────────────
export const WISHLIST_MESSAGES = {
    LOGIN_REQUIRED:          "Please login to manage wishlist",
    VARIANT_REQUIRED:        "Variant ID is required",
    ADDED:                   "Added to wishlist",
    REMOVED:                 "Removed from wishlist",
    LOAD_FAILED:             "Failed to load wishlist",
};

// ─── ORDER (User) ────────────────────────────────────────────
export const ORDER_MESSAGES = {
    CANCELLED:               "Order cancelled successfully.",
    RETURN_REQUESTED:        "Return request submitted.",
    ITEM_CANCELLED:          "Item cancelled successfully.",
    ITEM_RETURN_REQUESTED:   "Item return request submitted.",
    INVOICE_NOT_AVAILABLE:   "Invoice not available.",
    INVOICE_FAILED:          "Failed to generate invoice.",
};

// ─── ORDER (Admin) ───────────────────────────────────────────
export const ADMIN_ORDER_MESSAGES = {
    STATUS_UPDATED:            "Order status updated successfully",
    STATUS_UPDATE_FAILED:      "Failed to update status",
    ITEM_STATUS_UPDATED:       "Item status updated successfully",
    ITEM_STATUS_UPDATE_FAILED: "Failed to update item status",
    LOAD_FAILED:               "Failed to load orders",
    FETCH_FAILED:              "Failed to fetch order details",
    NOT_FOUND:                 "Order not found",
    RETURN_LOAD_FAILED:        "Failed to load return requests",
    INVOICE_NOT_AVAILABLE:     "Invoice not available.",
    INVOICE_FAILED:            "Failed to generate invoice.",
    INTERNAL_SERVER_ERROR:     "Internal server error",
};

// ─── CATEGORY (Admin) ────────────────────────────────────────
export const CATEGORY_MESSAGES = {
    ADDED:                   "Category added successfully",
    UPDATED:                 "Category updated successfully",
    DELETED:                 "Category deleted successfully",
    NOT_FOUND:               "Category not found",
    ALREADY_EXISTS:          "Category already exists",
    NAME_ALREADY_EXISTS:     "Category name already exists",
    INTERNAL_SERVER_ERROR:   "Internal Server Error",
};

// ─── OFFER (Admin) ───────────────────────────────────────────
export const OFFER_MESSAGES = {
    CREATED:                 "Offer created successfully!",
    UPDATED:                 "Offer updated successfully!",
    DELETED:                 "Offer deleted successfully.",
    NOT_FOUND:               "Offer not found.",
    REQUIRED_FIELDS_MISSING: "Required fields are missing.",
    SELECT_APPLICABLE_ITEM:  "Please select an applicable item.",
    REFERRAL_NOT_ALLOWED:    "Referral offers cannot be managed from admin.",
    ADMIN_ONLY:              "Only product and category offers can be managed from admin.",
    CREATE_FAILED:           "Failed to create offer.",
    UPDATE_FAILED:           "Failed to update offer.",
    DELETE_FAILED:           "Failed to delete offer.",
    STATUS_UPDATE_FAILED:    "Failed to update offer status.",
    SERVER_ERROR:            "Server Error",
};

// ─── COUPON (Admin) ──────────────────────────────────────────
export const COUPON_MESSAGES = {
    CREATED:                 "Coupon created successfully!",
    UPDATED:                 "Coupon updated successfully!",
    DELETED:                 "Coupon deleted successfully.",
    NOT_FOUND:               "Coupon not found.",
    REQUIRED_FIELDS_MISSING: "All required fields must be filled.",
    CODE_EXISTS:             "A coupon with this code already exists.",
    CODE_EXISTS_OTHER:       "Another coupon with this code already exists.",
    CREATE_FAILED:           "Failed to create coupon.",
    UPDATE_FAILED:           "Failed to update coupon.",
    DELETE_FAILED:           "Failed to delete coupon.",
    STATUS_UPDATE_FAILED:    "Failed to update coupon status.",
    SERVER_ERROR:            "Server Error",
};

// ─── PRODUCT (Admin) ─────────────────────────────────────────
export const PRODUCT_MESSAGES = {
    DELETED:                 "Product deleted successfully",
    VARIANT_DELETED:         "Variant deleted successfully",
    SERVER_ERROR:            "Server Error",
};

// ─── REVIEW ──────────────────────────────────────────────────
export const REVIEW_MESSAGES = {
    LOGIN_REQUIRED:          "Please log in to submit a review.",
    LOGIN_REQUIRED_DELETE:   "Please log in to delete a review.",
    FIELDS_REQUIRED:         "Rating and comment are required.",
    NOT_FOUND:               "Product not found.",
    REVIEW_NOT_FOUND:        "Review not found.",
    ALREADY_REVIEWED:        "You have already reviewed this product.",
    ADDED:                   "Review added successfully.",
    ERROR_SUBMITTING:        "An error occurred while submitting the review.",
    NOT_AUTHORIZED:          "You are not authorized to delete this review.",
    DELETED:                 "Review deleted successfully.",
    ERROR_DELETING:          "An error occurred while deleting the review.",
};

// ─── PROFILE ─────────────────────────────────────────────────
export const PROFILE_MESSAGES = {
    UPDATED:                 "Profile updated successfully",
    SOMETHING_WRONG:         "Something went wrong",
    PASSWORD_UPDATED:        "Password updated successfully",
    NO_CURRENT_EMAIL:        "Could not find current email address.",
    OTP_SEND_FAILED:         "Failed to send OTP. Please try again.",
    OTP_SENT:                "OTP sent to your current email address.",
    REQUEST_OTP_FAILED:      "Failed to request OTP.",
    INVALID_OTP:             "Invalid OTP.",
    OTP_EXPIRED:             "OTP has expired. Please request a new one.",
    EMAIL_VERIFIED:          "Current email verified successfully.",
    VERIFY_OTP_FAILED:       "Failed to verify OTP.",
    VERIFY_CURRENT_FIRST:    "Please verify your current email first.",
    SAME_EMAIL:              "This is already your current email address",
    VERIFICATION_LINK_SENT:  "A verification link has been sent to your new email address. Please check your inbox (and spam folder).",
    SEND_LINK_FAILED:        "Failed to send verification link. Please try again later.",
};

// ─── WALLET ──────────────────────────────────────────────────
export const WALLET_MESSAGES = {
    FETCH_BALANCE_FAILED:    "Failed to fetch wallet balance",
};

// ─── PAYMENT ─────────────────────────────────────────────────
export const PAYMENT_MESSAGES = {
    AMOUNT_REQUIRED:         "Amount is required",
    ORDER_NOT_FOUND:         "Order not found.",
    RETRY_PENDING_FAILED:    "Only pending failed orders can be retried.",
    RETRY_NOT_ALLOWED:       "This order cannot be retried.",
    AMOUNT_MISMATCH:         "Order amount mismatch. Please reload and try again.",
    DETAILS_REQUIRED:        "Payment verification details are required",
    INVALID_SIGNATURE:       "Invalid payment signature",
    VERIFIED:                "Payment verified successfully",
    PRICE_CHANGE_INCREASE:   "The order total has changed due to expired offers or price updates. Please refresh the checkout page to see the new total.",
    PRICE_CHANGE_DECREASE:   "Great news! A new offer was just applied to your cart, reducing your total. Please refresh the checkout page to place your order at the new lower price!",
};

// ─── CHECKOUT ────────────────────────────────────────────────
export const CHECKOUT_MESSAGES = {
    MISSING_FIELDS:              "Missing required fields.",
    ADDRESS_INVALID:             "Selected address is invalid.",
    VERIFICATION_REQUIRED:       "Payment verification details are required.",
    VERIFICATION_FAILED:         "Payment verification failed.",
    ORDER_PLACED:                "Order placed successfully!",
    PAYMENT_FAILED_SAVED:        "Payment was not completed. Order saved with Failed status.",
    MISSING_VERIFICATION_FIELDS: "Missing required verification fields.",
    PAYMENT_SUCCESS:             "Payment successful!",
    COUPON_REQUIRED:             "Please enter a coupon code.",
    COUPON_ALREADY_APPLIED:      "This coupon is already applied.",
    COUPON_APPLIED:              "Coupon applied successfully!",
    COUPON_REMOVED:              "Coupon removed successfully!",
    COUPON_REMOVE_FAILED:        "Failed to remove coupon.",
};

// ─── PAGES ───────────────────────────────────────────────────
export const PAGES_MESSAGES = {
    UPGRADED_OR_MOVED:       "The page you are looking for has been upgraded or moved to a different dimension.",
    PRODUCT_UNAVAILABLE:     "This product is currently unavailable.",
    PRODUCT_NOT_EXIST:       "The product you are looking for does not exist.",
};

// ─── REPORT (Admin) ──────────────────────────────────────────
export const REPORT_MESSAGES = {
    LOAD_FAILED:             "Failed to load reports.",
};

// ─── GENERIC / SHARED ────────────────────────────────────────
export const GENERIC_MESSAGES = {
    SERVER_ERROR:            "Server Error",
    INTERNAL_SERVER_ERROR:   "Internal Server Error",
    NOT_FOUND:               "Not found.",
};

