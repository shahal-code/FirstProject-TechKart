import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";


async function getProductDetails(productId) {
    const product = await Product.findById(productId)
        .populate("category_id")
        .lean();

    if (!product || product.is_blocked) return null;

    // Fetch related products (same category)
    const relatedProducts = await Product.find({
        category_id: product.category_id?._id || product.category_id,
        _id: { $ne: product._id },
        is_blocked: { $ne: true }
    })
        .populate("category_id")
        .limit(4)
        .lean();

    return { product, relatedProducts };
}

const getShopData = async (queryParams) => {
    const { search, category, sort, page = 1, limit = 6 } = queryParams;

    // 1. Build the Query Object
    let query = { is_blocked: { $ne: true } }; // Base query: only show unblocked products

    if (search) {
        query.name = { $regex: search, $options: "i" }; // Case insensitive search
    }

    if (category) {
        query.category_id = category;
    }

    if (queryParams.processor) {
        const processors = Array.isArray(queryParams.processor)
            ? queryParams.processor
            : [queryParams.processor];
        const processorRegexes = processors.map(p => new RegExp(p, 'i'));
        query["$or"] = [
            { "variants.processor": { $in: processorRegexes } },
            { "variants.processorBrand": { $in: processorRegexes } }
        ];
    }

    if (queryParams.ram) {
        if (Array.isArray(queryParams.ram)) {
            query["variants.ram"] = { $in: queryParams.ram };
        } else {
            query["variants.ram"] = queryParams.ram;
        }
    }

    if (queryParams.gpu) {
        if (Array.isArray(queryParams.gpu)) {
            query["variants.gpu"] = { $in: queryParams.gpu };
        } else {
            query["variants.gpu"] = queryParams.gpu;
        }
    }

    if (queryParams.storage) {
        if (Array.isArray(queryParams.storage)) {
            query["variants.storage"] = { $in: queryParams.storage };
        } else {
            query["variants.storage"] = queryParams.storage;
        }
    }

    if (queryParams.size) {
        if (Array.isArray(queryParams.size)) {
            query["variants.size"] = { $in: queryParams.size };
        } else {
            query["variants.size"] = queryParams.size;
        }
    }

    let sortOrder = {};
    if (sort === "priceLow") {
        sortOrder = { "variants.price": 1 };
    } else if (sort === "priceHigh") {
        sortOrder = { "variants.price": -1 };
    } else if (sort === "aa") {
        sortOrder = { name: 1 };
    } else if (sort === "zz") {
        sortOrder = { name: -1 };
    } else {
        sortOrder = { createdAt: -1 };
    }

    // 2. Build the Price Filter
    if (queryParams.price) {
        if (queryParams.price === "under50000") {
            query["variants.price"] = { $lt: 50000 };
        } else if (queryParams.price === "50000-100000") {
            query["variants.price"] = { $gte: 50000, $lte: 100000 };
        } else if (queryParams.price === "100000-200000") {
            query["variants.price"] = { $gte: 100000, $lte: 200000 };
        } else if (queryParams.price === "over200000") {
            query["variants.price"] = { $gt: 200000 };
        }
    } else if (queryParams.maxPrice) {
        const max = parseInt(queryParams.maxPrice);
        if (!isNaN(max)) {
            query["variants.price"] = { $lte: max };
        }
    }

    // 3. Fetch Data with Pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
        .populate("category_id")
        .sort(sortOrder)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    const totalProducts = await Product.countDocuments(query);
    const categories = await Category.find({ is_blocked: false });

    return {
        products,
        categories,
        totalProducts,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / limit)
    };
};

async function getFeaturedProducts(limit = 3) {
    return await Product.find({ is_blocked: { $ne: true } })
        .populate("category_id")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
}

export {
    getShopData,
    getProductDetails,
    getFeaturedProducts
};
