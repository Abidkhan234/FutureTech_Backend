import fs from "fs-extra";
import cloudinary from '../Config/CloudinaryConfig.js'

const uploadFileToCloudinary = async (localFilePath) => {
    try {

        if (!localFilePath) {
            return;
        }
        const publicFile = await cloudinary.uploader.upload(localFilePath, {
            folder: "Blog_Web_Images",
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
        throw error
    }
}

const removeFileFromCloudinary = async (publicId) => {
    try {

        if (!publicId) {
            return;
        }

        const status = await cloudinary.uploader.destroy(publicId, {
            folder: "Blog_Web_Images",
        });

        return status;
    } catch (error) {
        console.log(error);
        throw error
    }
}

export { uploadFileToCloudinary, removeFileFromCloudinary };