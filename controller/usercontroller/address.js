import User from "../../models/userModel.js";
import Address from "../../models/addressModel.js";

export const load_address = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        const addresses = await Address.find({ user_id: req.session.user }).sort({ createdAt: -1 });
        res.render("user/address/address", { user, addresses });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const load_addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        res.render("user/address/addNewAddress", { user });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const addAddress = async (req, res) => {
    try {
        const {
            fullname,
            phone,
            email,
            line1,
            line2,
            city,
            state,
            postal_code,
            address_type
        } = req.body;

        const userId = req.session.user;

        const newAddress = new Address({
            user_id: userId,
            fullname,
            phone,
            email,
            line1,
            line2,
            city,
            state,
            postal_code,
            address_type
        });

        await newAddress.save();
        res.redirect("/user/address");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const load_editAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const address = await Address.findById(addressId);
        const user = await User.findById(req.session.user);
        res.render("user/address/editAddress", { address, user });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const editAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const { fullname, phone, email, line1, line2, city, state, postal_code, address_type } = req.body;
        await Address.findByIdAndUpdate(addressId, {
            fullname, phone, email, line1, line2, city, state, postal_code, address_type
        });
        res.redirect("/user/address");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        await Address.findByIdAndDelete(addressId);
        res.redirect("/user/address");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const setDefaultAddress = async (req, res) => {
    // Logic for setting default address
};
