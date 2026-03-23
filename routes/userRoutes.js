import express from "express";
import passport from "passport";
import { upload } from "../config/multer.js";
const router = express.Router();
import * as userAuth from "../middleware/userAuth.js";
router.use(userAuth.noCache);
import * as usercontroller from "../controller/usercontroller/user.auth.js";
import * as PageController from "../controller/usercontroller/pages.controller.js";
import * as Profile from "../controller/usercontroller/profile.js";
import * as Address from "../controller/usercontroller/address.js";


// Authentication
router
  .route('/login')
  .get(userAuth.isAlreadyLoggedIn, usercontroller.loadlogin)
  .post(userAuth.isAlreadyLoggedIn, usercontroller.login);

router
  .route('/signup')
  .get(userAuth.isAlreadyLoggedIn, usercontroller.loadsignup)
  .post(userAuth.isAlreadyLoggedIn, usercontroller.signup);

router
  .route('/otp')
  .get(userAuth.isAlreadyLoggedIn, usercontroller.load_otp)
  .post(userAuth.isAlreadyLoggedIn, usercontroller.Verifyotp);

router.post('/resend-otp', usercontroller.resendOTP);

router
  .route('/forgot-password')
  .get(userAuth.isAlreadyLoggedIn, usercontroller.load_Forgot_Password)
  .post(userAuth.isAlreadyLoggedIn, usercontroller.fogotPassword);

router
  .route('/reset-password')
  .get(userAuth.isAlreadyLoggedIn, usercontroller.load_reset_password)
  .post(userAuth.isAlreadyLoggedIn, usercontroller.reset_Password);

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
    req.session.loginMethod = 'google';
    res.redirect(303, "/user/dashboard");
  }
);

// Pages
router.get('/', userAuth.isBlocked, PageController.LandingOrHome_load);
router.get('/shop', userAuth.isAuthenticated, userAuth.isBlocked, PageController.ShopPage_load);
router.get('/product/:id', userAuth.isBlocked, PageController.ProductDetails_load);
router.get('/contact', userAuth.isAuthenticated, userAuth.isBlocked, PageController.ContactPage_load);
router.get('/about', userAuth.isAuthenticated, userAuth.isBlocked, PageController.AboutPage_load);


router.get('/dashboard', userAuth.isAuthenticated, PageController.Dashboard_load);

// Profile
router.get('/profile', userAuth.isAuthenticated, userAuth.isBlocked, Profile.load_profile);
router.get('/profile/edit', userAuth.isAuthenticated, userAuth.isBlocked, Profile.load_editProfile);
router.post(
  "/profile/edit",
  userAuth.isAuthenticated,
  userAuth.isBlocked,
  upload.single("avatar"),
  Profile.editProfile
);

router.get('/profile/change-password', userAuth.isAuthenticated, userAuth.isBlocked, Profile.load_changePassword);
router.post('/profile/change-password', userAuth.isAuthenticated, userAuth.isBlocked, Profile.changePassword);

router.get('/profile/change-email', userAuth.isAuthenticated, userAuth.isBlocked, Profile.load_changeEmail);
router.post('/profile/change-email', userAuth.isAuthenticated, userAuth.isBlocked, Profile.sendChangeEmailLink);
router.get('/profile/change-email/verify/:token', Profile.verifyChangeEmailLink); // Doesn't strictly need isAuth middleware if we handle it in the controller, but good practice to have it on the session.
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

router.get('/address/set-default/:id', userAuth.isAuthenticated, Address.setDefaultAddress);
router.get('/settings', userAuth.isAuthenticated);

router.get('/logout', userAuth.isAuthenticated, usercontroller.isLogout);

export default router;
