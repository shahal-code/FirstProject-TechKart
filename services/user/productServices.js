import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";


export const getShopData = async (queryParams) => {
    const { search, category, sort, page = 1, limit = 9 } = queryParams;

    // 1. Build the Query Object
    let query = { is_blocked: { $ne: true } }; // Base query: only show unblocked products

    if (search) {
        query.name = { $regex: search, $options: "i" }; // Case insensitive search
    }

    if (category) {
        query.category_id = category;
    }

    // 2. Build the Sort Object
    let sortOrder = {};
    if (sort === "priceLow") sortOrder = { "variants.price": 1 };
    else if (sort === "priceHigh") sortOrder = { "variants.price": -1 };
    else if (sort === "aa") sortOrder = { name: 1 };
    else if (sort === "zz") sortOrder = { name: -1 };
    else sortOrder = { createdAt: -1 }; // Default: Newest first

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
