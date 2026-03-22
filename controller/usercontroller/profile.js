import * as ProfileService from "../../services/user/profileService.js";
import { validateChangePasswordData, validateEmail } from '../../utils/validation.js';
import { sendVerificationLink } from '../../config/nodemailer.js';
import crypto from 'crypto';

export const load_profile = async (req, res) => {
    try {
        const user = await ProfileService.getProfile(req.session.user);
        res.render("user/profile/profile", { user, path: "/user/profile" });
    } catch (error) {
        console.error("Error loading profile:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const load_editProfile = async (req, res) => {
    try {
        const user = await ProfileService.getProfile(req.session.user);
        res.render("user/profile/edit-profile", { user, path: "/user/profile" });
    } catch (error) {
        console.error("Error loading edit profile page:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.session.user;
        const { fullname, phone } = req.body;
        const updateData = { fullname, phone };

        if (req.file) {
            updateData.profileImage = req.file.path;
        }

        await ProfileService.updateProfile(userId, updateData);

        res.json({
            success: true,
            message: "Profile updated successfully",
            redirect: "/user/profile"
        });

    } catch (error) {
        console.error("Edit Profile Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const load_changePassword = async (req, res) => {
    try {
        const user = await ProfileService.getProfile(req.session.user);
        if (req.session.loginMethod === 'google') {
            return res.redirect("/user/profile");
        }
        res.render("user/auth/change-password", { user, path: "/user/profile" });
    } catch (error) {
        console.error("Error loading change password page:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const load_changeEmail = async (req, res) => {
    try {
        const user = await ProfileService.getProfile(req.session.user);
        if (req.session.loginMethod === 'google') {
            return res.redirect("/user/profile");
        }
        res.render("user/auth/change-email", { user, path: "/user/profile" });
    } catch (error) {
        console.error("Error loading change email page:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user;
        const errors = validateChangePasswordData(req.body);
        if (errors) return res.status(400).json({ success: false, errors });

        await ProfileService.changePassword(userId, currentPassword, newPassword);
        res.json({ success: true, message: "Password updated successfully", redirect: "/user/profile" });

    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(error.message === "Incorrect current password" ? 400 : 500).json({ 
            success: false, 
            message: error.message || "Internal server error" 
        });
    }
};

export const sendChangeEmailLink = async (req, res) => {
    try {
        const { newEmail } = req.body;
        const userId = req.session.user;

        const emailError = validateEmail(newEmail);
        if (emailError) return res.status(400).json({ success: false, message: emailError });

        const user = await ProfileService.getProfile(userId);
        if (user.email === newEmail) return res.status(400).json({ success: false, message: "This is already your current email address" });

        const token = crypto.randomBytes(32).toString('hex');
        req.session.changeEmailToken = {
            token,
            newEmail,
            expiresAt: Date.now() + 15 * 60 * 1000
        };

        const protocol = req.protocol === 'https' ? 'https' : 'http';
        const host = req.get('host');
        const verificationLink = `${protocol}://${host}/user/profile/change-email/verify/${token}`;

        await sendVerificationLink(newEmail, verificationLink);

        res.json({
            success: true,
            message: "A verification link has been sent to your new email address. Please check your inbox (and spam folder)."
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

        if (!userId) return res.redirect('/user/login?message=Please login to verify your email change');
        if (!sessionTokenData || sessionTokenData.token !== token) return res.redirect('/user/profile?message=Invalid verification link.');
        if (Date.now() > sessionTokenData.expiresAt) {
            delete req.session.changeEmailToken;
            return res.redirect('/user/profile?message=Verification link has expired. Please request a new one.');
        }

        await ProfileService.updateEmail(userId, sessionTokenData.newEmail);
        delete req.session.changeEmailToken;

        res.redirect('/user/profile?message=Email address updated successfully!');

    } catch (error) {
        console.error("Verify Email Link Error:", error);
        res.redirect('/user/profile?message=An error occurred during verification.');
    }
};
