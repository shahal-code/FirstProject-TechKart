import * as ProductService from "../../services/admin/productService.js";
import * as CategoryService from "../../services/admin/categoryService.js";

// Load Product Inventory Page
export const loadProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const search = req.query.search || "";

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const { products, totalProducts, totalPages } = await ProductService.getAllProducts(query, page, limit);

        res.render("admin/product/products", {
            products,
            page,
            totalPages,
            totalProducts,
            search,
            activePage: "products"
        });
    } catch (error) {
        console.error("Error loading products:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Get Add Product Page
export const getAddProductPage = async (req, res) => {
    try {
        const categories = await CategoryService.getAllCategories({ is_blocked: false }, 1, 100); 
        res.render("admin/product/add-product", {
            categories: categories.categories,
            product: null,
            activePage: "products"
        });
    } catch (error) {
        console.error("Error loading add product page:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Add New Product via POST
export const addProduct = async (req, res) => {
    try {
        await ProductService.createProduct(req.body, req.files);
        res.redirect("/admin/product");
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(400).send(`Error: ${error.message}`);
    }
};

// Get Edit Product Page
export const getEditProductPage = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductService.getProductById(id);
        const categories = await CategoryService.getAllCategories({ is_blocked: false }, 1, 100);

        if (!product) {
            return res.redirect("/admin/product");
        }

        res.render("admin/product/edit-product", {
            product,
            categories: categories.categories,
            activePage: "products"
        });
    } catch (error) {
        console.error("Error loading edit product page:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Update Product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await ProductService.updateProduct(id, req.body, req.files);
        res.redirect("/admin/product");
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(error.message === "Product not found" ? 404 : 400).send(`Error: ${error.message}`);
    }
};

// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await ProductService.deleteProduct(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(error.message === "Product not found" ? 404 : 500).json({ 
            error: error.message || "Internal Server Error" 
        });
    }
};
