import User from "../../models/userModel.js";

export const load_profile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        res.render("user/profile/profile", { user, path: "/user/profile" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const load_editProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        res.render("user/profile/edit-profile", { user, path: "/user/profile" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.session.user;

        const { fullname, phone } = req.body;

        const updateData = {
            fullname,
            phone
        };

        //  HANDLE IMAGE UPLOAD
        if (req.file) {
            updateData.profileImage = req.file.path; // Cloudinary URL
        }

        await User.findByIdAndUpdate(userId, updateData);

        res.json({
            success: true,
            message: "Profile updated successfully",
            redirect: "/user/profile"
        });

    } catch (error) {
        console.log("Edit Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};


export const load_changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        if (req.session.loginMethod === 'google') {
            return res.redirect("/user/profile");
        }
        res.render("user/auth/change-password", { user, path: "/user/profile" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const load_changeEmail = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        if (req.session.loginMethod === 'google') {
            return res.redirect("/user/profile");
        }
        res.render("user/auth/change-email", { user, path: "/user/profile" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { validatePassword, validateEmail } from '../../utils/validation.js';
import { sendVerificationLink } from '../../config/nodemailer.js';

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user;

        const validationError = validatePassword(newPassword);
        if (validationError) {
             return res.status(400).json({ success: false, message: validationError });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "New passwords do not match" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: "Password updated successfully", redirect: "/user/profile" });

    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const sendChangeEmailLink = async (req, res) => {
    try {
        const { newEmail } = req.body;
        const userId = req.session.user;

        const emailError = validateEmail(newEmail);
        if (emailError) {
             return res.status(400).json({ success: false, message: emailError });
        }

        const user = await User.findById(userId);
        if (!user) {
             return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.email === newEmail) {
             return res.status(400).json({ success: false, message: "This is already your current email address" });
        }

        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
             return res.status(400).json({ success: false, message: "Email address is already in use by another account" });
        }

        // Generate a secure token
        const token = crypto.randomBytes(32).toString('hex');

        // Store token data in session (for a robust app, store in Redis or DB)
        req.session.changeEmailToken = {
             token,
             newEmail,
             expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
        };

        const protocol = req.protocol === 'https' ? 'https' : 'http';
        const host = req.get('host');
        // If behind a proxy, you might need req.headers['x-forwarded-host'] or similar.
        const verificationLink = `${protocol}://${host}/user/profile/change-email/verify/${token}`;

        await sendVerificationLink(newEmail, verificationLink);

        res.json({ 
            success: true, 
            message: "A verification link has been sent to your new email address. Please check your inbox (and spam folder).",
            // We don't immediately redirect because we want them to read the success message. The frontend can handle redirection or just showing the message.
        });

    } catch (error) {
        console.error("Send Email Link Error:", error);
        res.status(500).json({ success: false, message: "Failed to send verification link. Please try again later." });
    }
};

export const verifyChangeEmailLink = async (req, res) => {
    try {
        const { token } = req.params;
        const sessionTokenData = req.session.changeEmailToken;
        const userId = req.session.user;

        if (!userId) {
            // They need to be logged in to change their email.
            return res.redirect('/user/login?message=Please login to verify your email change');
        }

        if (!sessionTokenData) {
            // Token data not found (either expired session, or invalid state)
            // A production app would store these in the DB for persistence across sessions/devices.
            // But since this is session-based, they must verify on the same browser session.
            return res.redirect('/user/profile?message=Verification link expired or invalid. Please try again.');
        }

        if (sessionTokenData.token !== token) {
             return res.redirect('/user/profile?message=Invalid verification link.');
        }

        if (Date.now() > sessionTokenData.expiresAt) {
             delete req.session.changeEmailToken;
             return res.redirect('/user/profile?message=Verification link has expired. Please request a new one.');
        }

        // Token is valid! Update the user's email.
        const user = await User.findById(userId);
        if (!user) {
             return res.redirect('/user/profile?message=User not found');
        }

        user.email = sessionTokenData.newEmail;
        await user.save();

        // Clear the token from session
        delete req.session.changeEmailToken;

        res.redirect('/user/profile?message=Email address updated successfully!');

    } catch (error) {
         console.error("Verify Email Link Error:", error);
         res.redirect('/user/profile?message=An error occurred during verification.');
    }
};
