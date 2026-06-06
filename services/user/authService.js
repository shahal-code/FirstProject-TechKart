import User from "../../models/userModel.js";
import Wallet from "../../models/walletModel.js";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "../../config/nodemailer.js";

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generates a unique referral code for a user based on their name.
 * Format: TECHKART + 6 random alphanumeric chars (e.g. TECHKARTD9C8EF)
 */
const generateReferralCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let exists = true;
    while (exists) {
        const random = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        code = `TECHKART${random}`;
        exists = await User.exists({ referralCode: code });
    }
    return code;
};

/**
 * Credits ₹1000 to a user's wallet. Creates wallet if it doesn't exist.
 */
const creditWalletBonus = async (userId, description) => {
    await Wallet.findOneAndUpdate(
        { userId },
        {
            $inc: { balance: 1000 },
            $push: {
                transactions: {
                    type: "credit",
                    amount: 1000,
                    description,
                    status: "success"
                }
            }
        },
        { upsert: true, returnDocument: 'after' }
    );
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
 * Initial signup step: Validate, hash password, validate referral code, and prepare OTP.
 */
export const prepareSignup = async (fullname, email, password, referralCode) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    // Validate referral code if provided
    if (referralCode && referralCode.trim() !== "") {
        const code = referralCode.trim().toUpperCase();
        let referrer = await User.findOne({ referralCode: code });
        
        // Fallback for legacy users whose referralCode hasn't been saved to DB yet
        if (!referrer && code.startsWith('TECHKART') && code.length === 14) {
            const hexSuffix = code.substring(8).toLowerCase();
            referrer = await User.findOne({ 
                $expr: { $eq: [{ $substr: [{ $toString: "$_id" }, 18, 6] }, hexSuffix] } 
            });
            
            // If found, save it so it's permanently linked
            if (referrer && !referrer.referralCode) {
                referrer.referralCode = code;
                await referrer.save();
            }
        }

        if (!referrer) {
            throw new Error("Invalid referral code. Please check and try again.");
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    await sendOtpEmail(email, otp);

    return {
        userData: {
            fullname,
            email,
            password: hashedPassword,
            referredBy: referralCode ? referralCode.trim().toUpperCase() : null
        },
        otp,
        otpExpiry: Date.now() + 60 * 1000
    };
};

/**
 * Create user after OTP verification.
 * - Assigns a unique referral code to the new user.
 * - If they used a referral code, credits ₹1000 to both users' wallets.
 */
export const completeSignup = async (userData) => {
    const { referredBy, ...userFields } = userData;

    // Generate a unique referral code for the new user
    const referralCode = await generateReferralCode();

    const newUser = new User({ ...userFields, referralCode });
    await newUser.save();

    // Process referral bonus if they used a referral code
    if (referredBy) {
        const referrer = await User.findOne({ referralCode: referredBy });
        if (referrer) {
            // Credit ₹1000 to the new user
            await creditWalletBonus(
                newUser._id,
                `Referral signup bonus — you joined using ${referredBy}`
            );
            // Credit ₹1000 to the referrer
            await creditWalletBonus(
                referrer._id,
                `Referral bonus — ${newUser.fullname} joined using your code`
            );
        }
    }

    return newUser;
};

/**
 * Resend OTP.
 */
export const resendOtp = async (email) => {
    const otp = generateOtp();
    await sendOtpEmail(email, otp);
    return {
        otp,
        otpExpiry: Date.now() + 60 * 1000
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
        otpExpiry: Date.now() + 60 * 1000
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

