import * as AddressService from "../../services/user/addressService.js";
import * as ProfileService from "../../services/user/profileService.js";

export const load_address = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await ProfileService.getProfile(userId);
        const addresses = await AddressService.getAddressesByUserId(userId);
        res.render("user/address/address", { user, addresses });
    } catch (error) {
        console.error("Error loading addresses:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const load_addAddress = async (req, res) => {
    try {
        const user = await ProfileService.getProfile(req.session.user);
        res.render("user/address/addNewAddress", { user });
    } catch (error) {
        console.error("Error loading add address page:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const addAddress = async (req, res) => {
    try {
        await AddressService.addAddress(req.session.user, req.body);
        res.redirect("/user/address");
    } catch (error) {
        console.error("Error adding address:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const load_editAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await AddressService.getAddressById(id);
        const user = await ProfileService.getProfile(req.session.user);
        res.render("user/address/editAddress", { address, user });
    } catch (error) {
        console.error("Error loading edit address page:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const editAddress = async (req, res) => {
    try {
        const { id } = req.params;
        await AddressService.updateAddress(id, req.session.user, req.body);
        res.redirect("/user/address");
    } catch (error) {
        console.error("Error editing address:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        await AddressService.deleteAddress(id);
        res.redirect("/user/address");
    } catch (error) {
        console.error("Error deleting address:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user;
        await AddressService.setDefaultAddress(userId, id);
        res.redirect("/user/address");
    } catch (error) {
        console.error("Error setting default address:", error.message);
        res.status(500).send("Internal Server Error");
    }
};
