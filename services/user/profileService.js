import User from "../../models/userModel.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PROFILE_MESSAGES } from "../../constants/messages.js";


/**
 * Get user profile.
 */
export const getProfile = async (userId) => {
    return await User.findById(userId);
};

/**
 * Update user profile info.
 */
export const updateProfile = async (userId, updateData) => {
    return await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after' });
};

/**
 * Verify current password and update to new password.
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw new Error(PROFILE_MESSAGES.USER_NOT_FOUND);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error(PROFILE_MESSAGES.INCORRECT_CURRENT_PASSWORD);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    return await user.save();
};

/**
 * Set a new email for a user.
 */
export const updateEmail = async (userId, newEmail) => {
    const user = await User.findById(userId);
    if (!user) throw new Error(PROFILE_MESSAGES.USER_NOT_FOUND);
    
    user.email = newEmail;
    return await user.save();
};
