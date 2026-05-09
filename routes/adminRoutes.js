import express from "express";
import * as Dashboard from "../controller/admincontroller/dashboard.js";
import * as Customers from "../controller/admincontroller/customers.js";
import { validateLogin } from "../utils/validation.js";
import * as adminAuth from "../middleware/adminAuth.js";
import * as CategoryController from "../controller/admincontroller/categoryController.js";
import * as ProductController from "../controller/admincontroller/productController.js";
import { uploadProduct } from "../config/productMulter.js";
import * as orderController from "../controller/admincontroller/orderController.js"

const router = express.Router();

router.use(adminAuth.noCache);

router.get("/login", adminAuth.isAdminAlreadyLoggedIn, (req, res) => {
  const message = req.query.message || null;
  const email = req.query.email || null;
  res.render("admin/login", { message, email });
});

router.post("/login", adminAuth.isAdminAlreadyLoggedIn, (req, res) => {
  const { email, password } = req.body;

  const validationError = validateLogin(req.body);
  if (validationError) {
    return res.redirect(303, `/admin/login?message=${encodeURIComponent(validationError)}&email=${encodeURIComponent(email)}`);
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "12345";

  if (email === adminEmail && password === adminPassword) {
    req.session.admin = true;
    return req.session.save((err) => {
      if (err) console.log("Admin session save error:", err);
      res.redirect(303, "/admin/dashboard");
    });
  }

  res.redirect(303, `/admin/login?message=${encodeURIComponent("Invalid login credentials")}&email=${encodeURIComponent(email)}`);
});

router.get("/dashboard", adminAuth.isAdminLoggedIn, Dashboard.loadDashboard);

router.get("/users", adminAuth.isAdminLoggedIn, Customers.getUsers);

router.post("/users/:id/block", adminAuth.isAdminLoggedIn, Customers.blockUser);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Logout error:", err);
    }
    res.clearCookie("admin.sid");
    // res.header("Clear-Site-Data", '"cache", "cookies", "storage"');
    res.redirect("/admin/login");
  });
});

// Category
router.get("/category", adminAuth.isAdminLoggedIn, CategoryController.categoryInfo);
router.get("/addCategory", adminAuth.isAdminLoggedIn, CategoryController.getAddCategoryPage);
router.post("/addCategory", adminAuth.isAdminLoggedIn, CategoryController.addCategory);

router.get("/toggleCategory/:id", adminAuth.isAdminLoggedIn, CategoryController.toggleCategoryStatus);
router.post("/editCategory/:id", adminAuth.isAdminLoggedIn, CategoryController.editCategory);
router.get("/editCategory/:id", adminAuth.isAdminLoggedIn, CategoryController.getEditCategoryPage);
router.delete("/deleteCategory/:id", adminAuth.isAdminLoggedIn, CategoryController.deleteCategory);

// Product
router.get("/product", adminAuth.isAdminLoggedIn, ProductController.loadProducts);
router.get("/addProduct", adminAuth.isAdminLoggedIn, ProductController.getAddProductPage);
router.post("/product/add", adminAuth.isAdminLoggedIn, ProductController.addProduct); // No images here

router.get("/product/manage-variants/:id", adminAuth.isAdminLoggedIn, ProductController.getManageVariantsPage);
router.post("/product/:id/variants/add", adminAuth.isAdminLoggedIn, uploadProduct.array('images', 5), ProductController.addVariant);
router.post("/product/:id/variants/edit/:variantId", adminAuth.isAdminLoggedIn, uploadProduct.array('images', 5), ProductController.updateVariant);
router.delete("/product/:id/variants/delete/:variantId", adminAuth.isAdminLoggedIn, ProductController.deleteVariant);

router.get("/product/edit/:id", adminAuth.isAdminLoggedIn, ProductController.getEditProductPage);
router.post("/product/edit/:id", adminAuth.isAdminLoggedIn, ProductController.updateProduct); // No images here
router.post("/product/toggle-status/:id", adminAuth.isAdminLoggedIn, ProductController.toggleProductStatus);
router.delete("/product/delete/:id", adminAuth.isAdminLoggedIn, ProductController.deleteProduct);


//orders
router.get("/orders", adminAuth.isAdminLoggedIn,orderController.loadOrders);



export default router;
