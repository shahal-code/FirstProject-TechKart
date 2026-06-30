// ============================================================
//  constants/messages.js
//  Central source of truth for all response / UI messages.
//  Import only what you need per controller.
// ============================================================

// ─── AUTH ────────────────────────────────────────────────────
export const AUTH_MESSAGES = {
    INVALID_REFERRAL_CODE_PLEASE_CHECK_: "Invalid referral code. Please check and try again.",
    USER_ALREADY_EXISTS                : "User already exists",
    INVALID_PASSWORD                   : "Invalid Password",
    USER_NOT_FOUND                     : "User not found",
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
    THIS_PRODUCT_IS_CURRENTLY_UNAVAILAB: "This product is currently unavailable",
    PRODUCT_IS_OUT_OF_STOCK            : "Product is out of stock",
    ITEM_NOT_FOUND_IN_CART             : "Item not found in cart",
    PRODUCT_NOT_FOUND                  : "Product not found",
    VARIANT_NOT_FOUND                  : "Variant not found",
    CART_NOT_FOUND                     : "Cart not found",
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
    THIS_PRODUCT_IS_CURRENTLY_UNAVAILAB: "This product is currently unavailable and cannot be added to wishlist",
    PRODUCT_NOT_FOUND                  : "Product not found",
    LOGIN_REQUIRED:          "Please login to manage wishlist",
    VARIANT_REQUIRED:        "Variant ID is required",
    ADDED:                   "Added to wishlist",
    REMOVED:                 "Removed from wishlist",
    LOAD_FAILED:             "Failed to load wishlist",
};

// ─── ORDER (User) ────────────────────────────────────────────
export const ORDER_MESSAGES = {
    GREAT_NEWS_A_NEW_OFFER_WAS_JUST_APP: "Great news! A new offer was just applied to your cart, reducing your total. Please refresh the checkout page to place your order at the new lower price!",
    THE_ORDER_TOTAL_HAS_CHANGED_DUE_TO_: "The order total has changed due to expired offers or price updates. Please refresh the checkout page to see the new total.",
    ONE_OR_MORE_ITEMS_ARE_NO_LONGER_AVA: "One or more items are no longer available in the requested quantity.",
    THIS_ORDER_IS_NOT_ELIGIBLE_FOR_PAYM: "This order is not eligible for payment retry.",
    ONLY_PENDING_FAILED_ORDERS_CAN_BE_R: "Only pending failed orders can be retried.",
    ONLY_DELIVERED_ORDERS_CAN_BE_RETURN: "Only delivered orders can be returned.",
    ONLY_DELIVERED_ITEMS_CAN_BE_RETURNE: "Only delivered items can be returned.",
    INSUFFICIENT_WALLET_BALANCE        : "Insufficient wallet balance.",
    ITEM_NOT_FOUND_IN_ORDER            : "Item not found in order.",
    YOUR_CART_IS_EMPTY                 : "Your cart is empty.",
    ORDER_NOT_FOUND                    : "Order not found.",
    CANCELLED:               "Order cancelled successfully.",
    RETURN_REQUESTED:        "Return request submitted.",
    ITEM_CANCELLED:          "Item cancelled successfully.",
    ITEM_RETURN_REQUESTED:   "Item return request submitted.",
    INVOICE_NOT_AVAILABLE:   "Invoice not available.",
    INVOICE_FAILED:          "Failed to generate invoice.",
};

// ─── ORDER (Admin) ───────────────────────────────────────────
export const ADMIN_ORDER_MESSAGES = {
    RETURN_REQUESTS_MUST_BE_SUBMITTED_B: "Return requests must be submitted by the customer.",
    ITEM_NOT_FOUND_IN_ORDER            : "Item not found in order.",
    INVALID_ORDER_STATUS               : "Invalid order status.",
    ORDER_NOT_FOUND                    : "Order not found.",
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
    CATEGORY_NAME_ALREADY_EXISTS       : "Category name already exists",
    CATEGORY_ALREADY_EXISTS            : "Category already exists",
    CATEGORY_NOT_FOUND                 : "Category not found",
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
    THIS_REFERRAL_CODE_HAS_REACHED_ITS_: "This referral code has reached its maximum usage limit.",
    THIS_REFERRAL_CODE_IS_EXPIRED_OR_NO: "This referral code is expired or not active yet.",
    YOU_HAVE_ALREADY_USED_THIS_REFERRAL: "You have already used this referral code.",
    PLEASE_ENTER_A_REFERRAL_CODE       : "Please enter a referral code.",
    INVALID_REFERRAL_CODE              : "Invalid referral code.",
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
    THE_APPLIED_COUPON_IS_NO_LONGER_VAL: "The applied coupon is no longer valid. Please remove it and try again.",
    THE_APPLIED_COUPON_HAS_EXPIRED_PLEA: "The applied coupon has expired. Please remove it and try again.",
    YOU_HAVE_ALREADY_USED_THIS_COUPON  : "You have already used this coupon.",
    THIS_COUPON_HAS_ALREADY_BEEN_USED  : "This coupon has already been used.",
    PLEASE_ENTER_A_COUPON_CODE         : "Please enter a coupon code.",
    COUPON_IS_NOT_AVAILABLE            : "Coupon is not available.",
    THIS_COUPON_HAS_EXPIRED            : "This coupon has expired.",
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
    PLEASE_UPLOAD_AT_LEAST_3_IMAGES_FOR: "Please upload at least 3 images for the variant.",
    VARIANT_MUST_HAVE_AT_LEAST_3_IMAGES: "Variant must have at least 3 images.",
    PRODUCT_NOT_FOUND                  : "Product not found",
    VARIANT_NOT_FOUND                  : "Variant not found",
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
    INCORRECT_CURRENT_PASSWORD         : "Incorrect current password",
    USER_NOT_FOUND                     : "User not found",
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
    INSUFFICIENT_WALLET_BALANCE        : "Insufficient wallet balance",
    FETCH_BALANCE_FAILED:    "Failed to fetch wallet balance",
};

// ─── PAYMENT ─────────────────────────────────────────────────
export const PAYMENT_MESSAGES = {
    INVALID_PAYMENT_AMOUNT             : "Invalid payment amount",
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
    USER_NOT_FOUND                     : "User not found",
    SERVER_ERROR:            "Server Error",
    INTERNAL_SERVER_ERROR:   "Internal Server Error",
    NOT_FOUND:               "Not found.",
};

