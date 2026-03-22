import User from "../../models/userModel.js";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "../../config/nodemailer.js";

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Authenticate user with email and password.
 */
export const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    if (!user.password) {
        throw new Error("This account was created with Google. Please use 'Sign in with Google'.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid Password");

    return user;
};

/**
 * Initial signup step: Validate, hash password, and prepare OTP.
 */
export const prepareSignup = async (fullname, email, password) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    await sendOtpEmail(email, otp);

    return {
        userData: { fullname, email, password: hashedPassword },
        otp,
        otpExpiry: Date.now() + 15 * 1000
    };
};

/**
 * Create user after OTP verification.
 */
export const completeSignup = async (userData) => {
    const newUser = new User(userData);
    return await newUser.save();
};

/**
 * Resend OTP.
 */
export const resendOtp = async (email) => {
    const otp = generateOtp();
    await sendOtpEmail(email, otp);
    return {
        otp,
        otpExpiry: Date.now() + 15 * 1000
    };
};

/**
 * Initial forgot password step: Validate and send OTP.
 */
export const preparePasswordReset = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const otp = generateOtp();
    await sendOtpEmail(email, otp);

    return {
        otp,
        otpExpiry: Date.now() + 15 * 1000
    };
};

/**
 * Final reset password step: Update password.
 */
export const resetPassword = async (email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await User.updateOne(
        { email },
        { $set: { password: hashedPassword } }
    );
};
