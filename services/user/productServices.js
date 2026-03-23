import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";

export const getShopData = async () => {

    const products = await Product.find({}).populate("category_id");
    const categories = await Category.find({ is_blocked: false });
    return { products, categories };
};



