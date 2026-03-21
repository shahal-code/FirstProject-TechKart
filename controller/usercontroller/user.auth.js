import User from "../../models/userModel.js";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "../../config/nodemailer.js";
import {
    validateSignup,
    validateLogin,
    validateEmail,
    validateOtp,
    validatePassword
} from "../../utils/validation.js";

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const loadlogin = async (req, res) => {
    try {
        const message = req.query.message || null;
        const email = req.query.email || null;
        res.render("user/auth/login", { message, email });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const validationError = validateLogin(req.body);
        if (validationError) {
            return res.redirect(303, `/user/login?message=${encodeURIComponent(validationError)}&email=${encodeURIComponent(email)}`);
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect(303, `/user/login?message=${encodeURIComponent("User not found")}&email=${email ? encodeURIComponent(email) : ""}`);
        }

        if (!user.password) {
            return res.redirect(303, `/user/login?message=${encodeURIComponent("This account was created with Google. Please use 'Sign in with Google'.")}&email=${encodeURIComponent(email)}`);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.redirect(303, `/user/login?message=${encodeURIComponent("Invalid Password")}&email=${encodeURIComponent(email)}`);
        }
        req.session.user = user._id;
        req.session.loginMethod = 'local';
        req.session.save((err) => {
            if (err) console.log("User session save error:", err);
            res.redirect(303, "/user/dashboard");
        });
    } catch (error) {
        console.log("Login Error:", error);
        res.redirect(303, `/user/login?message=${encodeURIComponent("An error occurred during login. Please try again.")}`);
    }
};

export const loadsignup = async (req, res) => {
    try {
        const message = req.query.message || null;
        const fullname = req.query.fullname || null;
        const email = req.query.email || null;
        res.render("user/auth/signup", { message, fullname, email });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const signup = async (req, res) => {
    try {
        const { fullname, email, password, confirmPassword } = req.body;

        const validationError = validateSignup(req.body);
        if (validationError) {
            return res.redirect(303, `/user/signup?message=${encodeURIComponent(validationError)}&fullname=${encodeURIComponent(fullname)}&email=${encodeURIComponent(email)}`);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect(303, `/user/signup?message=${encodeURIComponent("User already exists")}&fullname=${fullname ? encodeURIComponent(fullname) : ""}&email=${email ? encodeURIComponent(email) : ""}`);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOtp();

        // Store in session
        req.session.userData = {
            fullname,
            email,
            password: hashedPassword
        };
        req.session.otp = otp;
        req.session.otpExpiry = Date.now() + 2 * 60 * 1000; // 2 mins expiry

        // Send Email
        sendOtpEmail(email, otp).catch(err => console.error("Background OTP send error:", err));

        req.session.save((err) => {
            if (err) console.log("Session save error:", err);
            res.redirect(303, "/user/otp");
        });
    } catch (error) {
        console.log("Signup Error:", error);
        res.redirect(303, `/user/signup?message=${encodeURIComponent("An error occurred during signup. Please try again.")}`);
    }
};

export const load_otp = async (req, res) => {
    try {
        if (!req.session.userData && !req.session.resetEmail) {
            return res.redirect(303, "/user/signup");
        }
        const message = req.query.message || null;
        res.render("user/auth/otp", { message, actionUrl: "/user/otp", resendUrl: "/user/resend-otp" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const Verifyotp = async (req, res) => {
    try {
        const { otp } = req.body;

        const otpError = validateOtp(otp);
        if (otpError) {
            return res.redirect(303, `/user/otp?message=${encodeURIComponent(otpError)}`);
        }

        if (Date.now() > req.session.otpExpiry) {
            return res.redirect(303, `/user/otp?message=${encodeURIComponent("OTP has expired. Please resend.")}`);
        }

        if (otp === req.session.otp) {
            if (req.session.resetEmail) {
                // If it was for reset-password, redirect to reset-password page
                return res.redirect(303, "/user/reset-password");
            }
            const newUser = new User({
                fullname: req.session.userData.fullname,
                email: req.session.userData.email,
                password: req.session.userData.password
            });
            await newUser.save();

            // Clear signup session data
            delete req.session.userData;
            delete req.session.otp;
            delete req.session.otpExpiry;

            return res.redirect(303, "/user/login");
        } else {
            return res.redirect(303, `/user/otp?message=${encodeURIComponent("Invalid OTP. Please try again.")}`);
        }
    } catch (error) {
        console.log("OTP Verification Error:", error);
        res.redirect(303, `/user/otp?message=${encodeURIComponent("Verification failed. Please try again.")}`);
    }
};

export const resendOTP = async (req, res) => {
    try {
        const email = req.session.userData ? req.session.userData.email : req.session.resetEmail;
        if (!email) {
            return res.status(400).json({ success: false, message: "Session expired" });
        }

        const otp = generateOtp();
        req.session.otp = otp;
        req.session.otpExpiry = Date.now() + 2 * 60 * 1000;

        sendOtpEmail(email, otp).catch(err => console.error("Background OTP send error:", err));

        res.status(200).json({ success: true, message: "OTP resent successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to resend OTP" });
    }
};

export const load_Forgot_Password = async (req, res) => {
    try {
        const message = req.query.message || null;
        const email = req.query.email || null;
        res.render("user/auth/forgot-password", { message, email });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const fogotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const emailError = validateEmail(email);
        if (emailError) {
            return res.redirect(303, `/user/forgot-password?message=${encodeURIComponent(emailError)}&email=${encodeURIComponent(email)}`);
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect(303, `/user/forgot-password?message=${encodeURIComponent("User not found")}&email=${email ? encodeURIComponent(email) : ""}`);
        }

        const otp = generateOtp();

        req.session.resetEmail = email;
        req.session.otp = otp;
        req.session.otpExpiry = Date.now() + 2 * 60 * 1000;

        sendOtpEmail(email, otp).catch(err => console.error("Background OTP send error:", err));

        req.session.save((err) => {
            if (err) console.log("Session save error:", err);
            res.redirect(303, "/user/otp");
        });

    } catch (error) {
        console.log("Forgot Password Error:", error);
        res.redirect(303, `/user/forgot-password?message=${encodeURIComponent("Error sending OTP. Please try again.")}`);
    }
};

export const load_reset_password = async (req, res) => {
    const message = req.query.message || null;
    res.render("user/auth/reset-password", { message });
};

export const reset_Password = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.redirect(303, `/user/reset-password?message=${encodeURIComponent(passwordError)}`);
        }

        if (password !== confirmPassword) {
            return res.redirect(303, `/user/reset-password?message=${encodeURIComponent("Passwords do not match")}`);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.updateOne(
            { email: req.session.resetEmail },
            { $set: { password: hashedPassword } }
        );

        delete req.session.resetEmail;
        delete req.session.otp;
        delete req.session.otpExpiry;

        res.redirect(303, "/user/login");

    } catch (error) {
        console.log("Password Reset Error:", error);
        res.redirect(303, `/user/reset-password?message=${encodeURIComponent("Password reset failed. Please try again.")}`);
    }
};

export const isLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Logout error:", err);
            return res.redirect("/user");
        }

        res.clearCookie("connect.sid");
        res.header("Clear-Site-Data", '"cache", "cookies", "storage"');
        res.redirect("/user/login");
    });
};
