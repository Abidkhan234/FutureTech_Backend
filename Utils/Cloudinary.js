import cloudinary from "../Config/CloudinaryConfig.js";
import "dotenv/config";

const uploadFileToCloudinary = async (buffer, mime) => {
  try {
    if (!buffer) {
      return;
    }

    const base64String = buffer.toString("base64");
    const dataURI = `data:${mime};base64,${base64String}`;

    const publicFile = await cloudinary.uploader.upload(dataURI, {
      folder: process.env.CLOUDINARY_FOLDER_NAME,
    });

    if (!publicFile) {
      return;
    }

    return publicFile;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const removeFileFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return;
    }

    const status = await cloudinary.uploader.destroy(publicId, {
      folder: process.env.CLOUDINARY_FOLDER_NAME,
    });

    return status;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { uploadFileToCloudinary, removeFileFromCloudinary };
