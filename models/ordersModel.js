import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // 2. Custom Order ID (e.g., #TK-12345)
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    // 3. The Items Purchased
    orderedItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        variantId: {
            type: String, // Storing the variant ID from your product model
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number, // The price at the time of purchase
            required: true
        }
    }],
    // 4. Totals
    totalPrice: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    // 5. Shipping Address (Copy the data from your Address model)
    shippingAddress: {
        fullname: String,
        phone: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        postal_code: String
    },
    // 6. Payment & Status
    paymentMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Request', 'Returned'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
