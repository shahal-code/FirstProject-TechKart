import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";
import multer from "multer";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "techkart/products",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
});

export const uploadProduct = multer({ storage });
