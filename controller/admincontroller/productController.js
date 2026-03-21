import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";

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

        const products = await Product.find(query)
            .populate('category_id')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

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
        // Fetch categories to populate the dropdown
        const categories = await Category.find({ is_blocked: false });
        res.render("admin/product/add-product", {
            categories,
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
        const { name, description, category_id, price, size, ram, processor, storage, gpu, stock, sku } = req.body;
        
        // Multer puts Cloudinary URLs in req.files[].path
        const images = req.files ? req.files.map(file => file.path) : [];

        if (images.length < 4) {
            return res.status(400).send("Backend Error: Please upload at least 4 images for the product."); 
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

        await newProduct.save();

        res.redirect("/admin/product");
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
