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
        res.render("user/auth/login", { message, email: null });
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
            return res.render("user/auth/login", {
                message: validationError,
                email
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.render("user/auth/login", { message: "User not found", email });
        }
        if (user.isBlocked) {
            return res.render("user/auth/login", { message: "User is blocked by admin", email });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render("user/auth/login", { message: "Invalid Password", email });
        }
        req.session.user = user._id;
        req.session.save((err) => {
            if (err) console.log("User session save error:", err);
            res.redirect("/user/dashboard");
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("login failed");
    }
};

export const loadregister = async (req, res) => {
    try {
        res.render("user/auth/signup", { message: null, fullname: null, email: null });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const register = async (req, res) => {
    try {
        const { fullname, email, password, confirmPassword } = req.body;

        const validationError = validateSignup(req.body);
        if (validationError) {
            return res.render("user/auth/signup", {
                message: validationError,
                fullname,
                email
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("user/auth/signup", { message: "User already exists", fullname, email });
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
        await sendOtpEmail(email, otp);

        req.session.save((err) => {
            if (err) console.log("Session save error:", err);
            res.redirect("/user/otp");
        });
    } catch (error) {
        console.log(error);
        res.send("Signup Failed");
    }
};

export const load_otp = async (req, res) => {
    try {
        if (!req.session.userData && !req.session.resetEmail) {
            return res.redirect("/user/register");
        }
        res.render("user/auth/otp", { message: null, actionUrl: "/user/otp", resendUrl: "/user/resend-otp" });
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
            const actionUrl = "/user/otp";
            const resendUrl = "/user/resend-otp";
            return res.render("user/auth/otp", { message: otpError, actionUrl, resendUrl });
        }

        if (Date.now() > req.session.otpExpiry) {
            return res.render("user/auth/otp", { message: "OTP has expired. Please resend.", actionUrl: "/user/otp", resendUrl: "/user/resend-otp" });
        }

        if (otp === req.session.otp) {
            if (req.session.resetEmail) {
                // If it was for reset-password, redirect to reset-password page
                return res.redirect("/user/reset-password");
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

            return res.redirect("/user/login");
        } else {
            return res.render("user/auth/otp", { message: "Invalid OTP. Please try again.", actionUrl: "/user/otp", resendUrl: "/user/resend-otp" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Verification Failed");
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

        await sendOtpEmail(email, otp);

        res.status(200).json({ success: true, message: "OTP resent successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to resend OTP" });
    }
};

export const load_Forgot_Password = async (req, res) => {
    try {
        res.render("user/auth/forgot-password", { message: null, email: null });
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
            return res.render("user/auth/forgot-password", { message: emailError, email });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.render("user/auth/forgot-password", { message: "User not found", email });
        }

        const otp = generateOtp();

        req.session.resetEmail = email;
        req.session.otp = otp;
        req.session.otpExpiry = Date.now() + 2 * 60 * 1000;

        await sendOtpEmail(email, otp);

        req.session.save((err) => {
            if (err) console.log("Session save error:", err);
            res.redirect("/user/otp");
        });

    } catch (error) {
        console.log(error);
        res.send("Error sending OTP");
    }
};

export const load_reset_password = async (req, res) => {
    res.render("user/auth/reset-password", { message: null });
};

export const reset_Password = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.render("user/auth/reset-password", { message: passwordError });
        }

        if (password !== confirmPassword) {
            return res.render("user/auth/reset-password", { message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.updateOne(
            { email: req.session.resetEmail },
            { $set: { password: hashedPassword } }
        );

        delete req.session.resetEmail;
        delete req.session.otp;
        delete req.session.otpExpiry;

        res.redirect("/user/login");

    } catch (error) {
        console.log(error);
        res.send("Password reset failed");
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
