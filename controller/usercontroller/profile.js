import User from "../../models/userModel.js";

export const load_profile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        res.render("user/profile", { user, path: "/user/profile" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const load_editProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        res.render("user/profile", { user, message: "Edit Profile feature coming soon!" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

// Placeholder for other profile actions like editProfile, changePassword, etc.
export const editProfile = async (req, res) => {
    // Logic for updating profile
};

export const changePassword = async (req, res) => {
    // Logic for changing password
};

export const sendChangeEmailLink = async (req, res) => {
    // Logic for sending email change link
};

export const verifyChangeEmail = async (req, res) => {
    // Logic for verifying email change
};
