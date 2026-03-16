import express from "express";
import passport from "passport";
const router = express.Router();
import * as userAuth from "../middleware/userAuth.js";
import * as usercontroller from "../controller/usercontroller/user.auth.js";
import * as PageController from "../controller/usercontroller/pages.controller.js";
import * as Profile from "../controller/usercontroller/profile.js";
import * as Address from "../controller/usercontroller/address.js";

// Authentication
router
  .route('/login')
  .get(userAuth.isLoggin, usercontroller.loadlogin)
  .post(usercontroller.login);

router
  .route('/register')
  .get(userAuth.isLoggin, usercontroller.loadregister)
  .post(usercontroller.register);

router
  .route('/otp')
  .get(userAuth.isLoggin, usercontroller.load_otp)
  .post(usercontroller.Verifyotp);

router.post('/resend-otp', usercontroller.resendOTP);

router
  .route('/forgot-password')
  .get(userAuth.isLoggin, usercontroller.load_Forgot_Password)
  .post(usercontroller.fogotPassword);

router
  .route('/reset-password')
  .get(userAuth.isLoggin, usercontroller.load_reset_password)
  .post(usercontroller.reset_Password);

// Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/user/login" }),
  (req, res) => {
    req.session.user = req.user._id;
    res.redirect(303, "/user/dashboard");
  }
);

// Pages
router.get('/', userAuth.isBlocked, PageController.LandingOrHome_load);
router.get('/shop', userAuth.isBlocked, PageController.ShopPage_load);
router.get('/contact', PageController.ContactPage_load);
router.get('/about', PageController.AboutPage_load);

router.get('/dashboard', userAuth.isAuthenticated, PageController.Dashboard_load);

// Profile
router.get('/profile', userAuth.isAuthenticated, userAuth.isBlocked, Profile.load_profile);
router.get('/profile/edit', userAuth.isAuthenticated, userAuth.isBlocked, Profile.load_editProfile);

// Address
router.get('/address', userAuth.isAuthenticated, Address.load_address);
router.get('/address/add', userAuth.isAuthenticated, Address.load_addAddress);
router.get('/add-address', userAuth.isAuthenticated, Address.load_addAddress);
router.post('/address/add', userAuth.isAuthenticated, Address.addAddress);
router.get('/address/edit/:id', userAuth.isAuthenticated, Address.load_editAddress);
router.get('/edit-address/:id', userAuth.isAuthenticated, Address.load_editAddress);
router.post('/address/edit/:id', userAuth.isAuthenticated, Address.editAddress);
router.get('/address/delete/:id', userAuth.isAuthenticated, Address.deleteAddress);
router.get('/delete-address/:id', userAuth.isAuthenticated, Address.deleteAddress);
router.delete('/address/delete/:id', userAuth.isAuthenticated, Address.deleteAddress);

router.get('/logout', userAuth.isAuthenticated, usercontroller.isLogout);

export default router;
