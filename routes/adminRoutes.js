import express from "express";
import * as Dashboard from "../controller/admincontroller/dashboard.js";
import * as Customers from "../controller/admincontroller/customers.js";
import { validateLogin } from "../utils/validation.js";
import * as adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/login", adminAuth.isAdminLoggedOut, (req, res) => {
  res.render("admin/login", { message: null, email: null });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const validationError = validateLogin(req.body);
  if (validationError) {
    return res.render("admin/login", { message: validationError, email });
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "12345";

  if (email === adminEmail && password === adminPassword) {
    req.session.admin = true;
    return req.session.save((err) => {
        if (err) console.log("Admin session save error:", err);
        res.redirect("/admin/dashboard");
    });
  }

  res.render("admin/login", { message: "Invalid login credentials", email });
});

router.get("/dashboard", adminAuth.isAdminLoggedIn, Dashboard.loadDashboard);

router.get("/users", adminAuth.isAdminLoggedIn, Customers.getUsers);

router.post("/users/:id/block", adminAuth.isAdminLoggedIn, Customers.blockUser);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Logout error:", err);
    }
    res.clearCookie("connect.sid");
    res.header("Clear-Site-Data", '"cache", "cookies", "storage"');
    res.redirect("/admin/login");
  });
});


export default router;
