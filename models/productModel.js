import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema({
    size: { type: String },
    processor: { type: String },
    ram: { type: String },
    gpu: { type: String },
    storage: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    category_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    material: { 
        type: String 
    },
    variants: [productVariantSchema],
    images: [{ 
        type: String, 
        required: true 
    }],
    is_blocked: { 
        type: Boolean, 
        default: false 
    },
    is_unlisted: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
