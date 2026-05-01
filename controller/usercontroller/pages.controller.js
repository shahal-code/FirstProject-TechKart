import * as ProductService from "../../services/user/productServices.js";
import * as WishlistService from "../../services/user/wishlistServices.js";
import Category from "../../models/categoryModel.js";


export const LandingOrHome_load = async (req, res) => {
    try {
        const featuredProducts = await ProductService.getFeaturedProducts(3);
        const wishlistProductIds = await WishlistService.getWishlistProductIds(req.session.user);
        const categories = await Category.find({ is_blocked: false }).limit(4);
        res.render("user/home/home", {
            path: "/",
            products: featuredProducts,
            user: req.session.user || null,
            wishlistProductIds,
            categories
        });
    } catch (error) {
        console.log("Error loading home page:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const Dashboard_load = async (req, res) => {
    try {
        const featuredProducts = await ProductService.getFeaturedProducts(3);
        const wishlistProductIds = await WishlistService.getWishlistProductIds(req.session.user);
        const categories = await Category.find({ is_blocked: false }).limit(4);
        res.render("user/home/dashboard", {
            path: "/user/dashboard",
            products: featuredProducts,
            user: req.session.user || null,
            wishlistProductIds,
            categories
        });
    } catch (error) {
        console.log("Error loading dashboard:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const ContactPage_load = async (req, res) => {
    try {
        res.render("user/home/contact", { path: "/user/contact" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const AboutPage_load = async (req, res) => {
    try {
        res.render("user/home/about", { path: "/user/about" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const ShopPage_load = async (req, res) => {
    try {
        // Pass everything from the URL (?search=xx&sort=yy) to the service
        const data = await ProductService.getShopData(req.query);
        const wishlistProductIds = await WishlistService.getWishlistProductIds(req.session.user);
        const cart = req.session.user ? await (await import("../../services/user/cartService.js")).getCart(req.session.user) : { items: [] };

        res.render("user/shop/shop", {
            path: "/user/shop",
            ...data, // This spreads products, categories, totalPages, etc.
            query: req.query, // Pass query back to EJS to keep search text in input
            wishlistProductIds,
            cart
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


export const page_404 = async (req, res) => {
    try {
        res.render("user/404"); // Assuming there's a 404 view
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const Settings = async (req, res) => {
    try {
        res.render("views/settings");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal server Eroor");
    }
}
export const ProductDetails_load = async (req, res) => {
    try {
        const productId = req.params.id;
        const data = await ProductService.getProductDetails(productId);

        if (!data) {
            return res.status(404).render('user/404');
        }

        const wishlistProductIds = await WishlistService.getWishlistProductIds(req.session.user);

        // Fetch cart to show current quantities
        const cart = req.session.user ? await (await import("../../services/user/cartService.js")).getCart(req.session.user) : { items: [] };

        res.render('user/shop/productDetails', {
            ...data,
            cart,
            user: req.session.user || null,
            path: '/user/product',
            wishlistProductIds
        });
    } catch (error) {
        console.error("Error loading product details:", error);
        res.status(500).send("Server Error");
    }
}
