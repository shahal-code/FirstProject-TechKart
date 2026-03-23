import * as ProductService from "../../services/user/productServices.js";



export const LandingOrHome_load = async (req, res) => {
    try {
        res.render("user/home/home", { path: "/" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const Dashboard_load = async (req, res) => {
    try {
        res.render("user/home/dashboard", { path: "/user/dashboard" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const ContactPage_load = async (req, res) => {
    try {
        res.render("user/home/contact", { path: "/user/contact" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const AboutPage_load = async (req, res) => {
    try {
        res.render("user/home/about", { path: "/user/about" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const ShopPage_load = async (req, res) => {
    try {
        // Pass everything from the URL (?search=xx&sort=yy) to the service
        const data = await ProductService.getShopData(req.query);

        res.render("user/home/shop", {
            path: "/user/shop",
            ...data, // This spreads products, categories, totalPages, etc.
            query: req.query // Pass query back to EJS to keep search text in input
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


export const page_404 = async (req, res) => {
    try {
        res.render("user/404"); // Assuming there's a 404 view
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

export const Settings = async (req, res) => {
    try {
        res.render("views/settings");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal server Eroor");
    }
}
