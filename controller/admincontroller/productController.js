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
        console.log("Add Product Hit! Body:", JSON.stringify(req.body, null, 2));
        console.log("Files received:", req.files ? req.files.length : 0);
        
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

// Get Edit Product Page
export const getEditProductPage = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('category_id');
        const categories = await Category.find({ is_blocked: false });

        if (!product) {
            return res.redirect("/admin/product");
        }

        res.render("admin/product/edit-product", {
            product,
            categories,
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
        const { name, description, category_id, price, size, ram, processor, storage, gpu, stock, sku } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).send("Product not found");
        }

        // Handle Image Updates
        // If new images are uploaded, append them (or implement complex replacement logic)
        let images = product.images;
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            images = images.concat(newImages);
        }

        // Basic validation: ensure at least 4 images exist in total
        if (images.length < 4) {
            return res.status(400).send("Product must have at least 4 images.");
        }

        // Update basic info
        product.name = name;
        product.description = description;
        product.category_id = category_id;
        product.images = images;

        // Update the first variant (assuming single variant for now based on Add flow)
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
            // If no variants exist, create one
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

        await product.save();
        res.redirect("/admin/product");

    } catch (error) {
        console.error("Error updating product:", error);
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
