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
 * Create a new product.
 */
export const createProduct = async (productData, files) => {
    const { name, description, category_id, price, size, ram, processor, storage, gpu, stock, sku } = productData;
    const images = files ? files.map(file => file.path) : [];

    if (images.length < 4) {
        throw new Error("Please upload at least 4 images for the product.");
    }

    const newProduct = new Product({
        name,
        description,
        category_id,
        images,
        variants: [{
            size: size || "",
            processor: processor || "",
            ram: ram || "",
            gpu: gpu || "",
            storage: storage || "",
            price: price || 0,
            stock: stock || 100,
            sku: sku || "SKU-" + Date.now()
        }]
    });

    return await newProduct.save();
};

/**
 * Update an existing product.
 */
export const updateProduct = async (id, productData, files) => {
    const { name, description, category_id, price, size, ram, processor, storage, gpu, stock, sku } = productData;

    const product = await Product.findById(id);
    if (!product) {
        throw new Error("Product not found");
    }

    let images = product.images;

    // Handle image removal
    if (productData.removedImages) {
        const removed = Array.isArray(productData.removedImages)
            ? productData.removedImages
            : [productData.removedImages];

        images = images.filter(img => !removed.includes(img));
        console.log("Images after removal:", images.length);
    }

    // Add new images
    if (files && files.length > 0) {
        const newImages = files.map(file => file.path);
        images = images.concat(newImages);
    }

    if (images.length < 4) {
        throw new Error("Product must have at least 4 images.");
    }

    product.name = name;
    product.description = description;
    product.category_id = category_id;
    product.images = images;

    if (product.variants.length > 0) {
        product.variants[0] = {
            size: size || product.variants[0].size,
            processor: processor || product.variants[0].processor,
            ram: ram || product.variants[0].ram,
            gpu: gpu || product.variants[0].gpu,
            storage: storage || product.variants[0].storage,
            price: price || product.variants[0].price,
            stock: stock || product.variants[0].stock,
            sku: sku || product.variants[0].sku
        };
    } else {
        product.variants.push({
            size: size || "",
            processor: processor || "",
            ram: ram || "",
            gpu: gpu || "",
            storage: storage || "",
            price: price || 0,
            stock: stock || 100,
            sku: sku || "SKU-" + Date.now()
        });
    }

    return await product.save();
};

/**
 * Delete a product.
 */
export const deleteProduct = async (id) => {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
        throw new Error("Product not found");
    }
    return deletedProduct;
};
