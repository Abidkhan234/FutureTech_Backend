import { v2 as cloudinary } from 'cloudinary';
import "dotenv/config"
import fs from "fs-extra";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECERET
});

const uploadFileToCloudinary = async (localFilePath) => {
    try {

        if (!localFilePath) {
            return;
        }
        const publicFile = await cloudinary.uploader.upload(localFilePath, {
            folder: "Blog_Web_Images",
            transformation: [
                { width: 600, height: 400, crop: "fill", gravity: "auto" },
                { quality: "auto" }, // optimize image
                { fetch_format: "" } // choose best format like WebP
            ]
        });

        if (!publicFile) {
            return;
        }

        fs.removeSync(localFilePath);

        return publicFile;
    } catch (error) {
        console.log(error);
        if (localFilePath) {
            fs.removeSync(localFilePath);
        }
    }
}

export default uploadFileToCloudinary;