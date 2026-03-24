import Product from "../../models/productModel.js";

/**
 * Get all products with pagination and category populate.
 */
export const getAllProducts = async (query, page, limit) => {
    const products = await Product.find(query)
        .populate('category_id')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    return {
        products,
        totalProducts,
        totalPages
    };
};

/**
 * Get product by ID with populated category.
 */
export const getProductById = async (id) => {
    return await Product.findById(id).populate('category_id');
};

/**
 * Create a new base product.
 */
export const createProduct = async (productData) => {
    const { name, description, category_id } = productData;

    const newProduct = new Product({
        name,
        description,
        category_id,
        variants: [] // Variants added later
    });

    return await newProduct.save();
};

/**
 * Add a variant to an existing product.
 */
export const addVariant = async (productId, variantData, files) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const images = files ? files.map(file => file.path) : [];
    if (images.length < 3) throw new Error("Please upload at least 3 images for the variant.");

    const newVariant = {
        ...variantData,
        processorBrand: variantData.processorBrand,
        images,
        sku: variantData.sku || "SKU-" + Date.now()
    };

    product.variants.push(newVariant);
    return await product.save();
};

/**
 * Update a specific variant.
 */
export const updateVariant = async (productId, variantId, variantData, files) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
    if (variantIndex === -1) throw new Error("Variant not found");

    let images = product.variants[variantIndex].images;

    // Handle image removal
    if (variantData.removedImages) {
        const removed = Array.isArray(variantData.removedImages) ? variantData.removedImages : [variantData.removedImages];
        images = images.filter(img => !removed.includes(img));
    }

    // Add new images
    if (files && files.length > 0) {
        images = images.concat(files.map(f => f.path));
    }

    if (images.length < 3) throw new Error("Variant must have at least 3 images.");

    product.variants[variantIndex] = {
        ...product.variants[variantIndex].toObject(),
        ...variantData,
        processorBrand: variantData.processorBrand || product.variants[variantIndex].processorBrand,
        images
    };

    return await product.save();
};

/**
 * Delete a specific variant.
 */
export const deleteVariant = async (productId, variantId) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    product.variants = product.variants.filter(v => v._id.toString() !== variantId);
    return await product.save();
};

/**
 * Update an existing base product info.
 */
export const updateProduct = async (id, productData) => {
    const { name, description, category_id, material, highlights, display, battery, weight, os } = productData;

    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    product.name = name;
    product.description = description;
    product.category_id = category_id;
    product.material = material;
    if (highlights) {
        product.highlights = Array.isArray(highlights) ? highlights : highlights.split(',').map(h => h.trim());
    }
    product.specifications = { display, battery, weight, os };

    return await product.save();
};

/**
 * Delete a product.
 */
export const deleteProduct = async (id) => {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) throw new Error("Product not found");
    return deletedProduct;
};
