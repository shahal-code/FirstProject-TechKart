import User from "../../models/userModel.js";
import Address from "../../models/addressModel.js";

/**
 * Get all addresses for a user.
 */
export const getAddressesByUserId = async (userId) => {
    return await Address.find({ user_id: userId }).sort({ createdAt: -1 });
};

/**
 * Get address by ID.
 */
export const getAddressById = async (id) => {
    return await Address.findById(id);
};

/**
 * Create a new address.
 */
export const addAddress = async (userId, addressData) => {
    const newAddress = new Address({
        user_id: userId,
        ...addressData
    });
    return await newAddress.save();
};

/**
 * Update an existing address.
 */
export const updateAddress = async (id, addressData) => {
    return await Address.findByIdAndUpdate(id, addressData, { new: true });
};

/**
 * Delete an address.
 */
export const deleteAddress = async (id) => {
    return await Address.findByIdAndDelete(id);
};
