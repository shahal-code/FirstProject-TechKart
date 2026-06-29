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
    SERVER_ERROR:            "Server Error",
};

// ─── GENERIC / SHARED ────────────────────────────────────────
export const GENERIC_MESSAGES = {
    SERVER_ERROR:            "Server Error",
    INTERNAL_SERVER_ERROR:   "Internal Server Error",
    NOT_FOUND:               "Not found.",
};
