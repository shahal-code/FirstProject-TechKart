import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";


async function getProductDetails(productId) {
    const product = await Product.findOne({ 
        _id: productId, 
        is_blocked: { $ne: true } 
    }).populate('category_id');

    if (!product) return null;

    // Fetch related products (same category)
    const relatedProducts = await Product.find({
        category_id: product.category_id,
        _id: { $ne: productId },
        is_blocked: { $ne: true }
    }).limit(4);

    return { product, relatedProducts };
}

const getShopData = async (queryParams) => {
    const { search, category, sort, page = 1, limit = 9 } = queryParams;

    // 1. Build the Query Object
    let query = { is_blocked: { $ne: true } }; // Base query: only show unblocked products

    if (search) {
        query.name = { $regex: search, $options: "i" }; // Case insensitive search
    }

    if (category) {
        query.category_id = category;
    }

    if (queryParams.processor) {
        query["variants.processor"] = { $regex: queryParams.processor, $options: "i" };
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
        if (queryParams.price === "under1000") {
            query["variants.price"] = { $lt: 1000 };
        } else if (queryParams.price === "1000-2000") {
            query["variants.price"] = { $gte: 1000, $lte: 2000 };
        } else if (queryParams.price === "over2000") {
            query["variants.price"] = { $gt: 2000 };
        }
    }

    // 3. Fetch Data with Pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
        .populate("category_id")
        .sort(sortOrder)
        .skip(skip)
        .limit(limit);

    const totalProducts = await Product.countDocuments(query);
    const categories = await Category.find({ is_blocked: false });

    return {
        products,
        categories,
        totalProducts,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit)
    };
};

export {
    getShopData,
    getProductDetails
};
