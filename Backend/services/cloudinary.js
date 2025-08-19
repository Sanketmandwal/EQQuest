// cloudinary.js
import dotenv from "dotenv";
dotenv.config(); // safe guard: ensures env is loaded if this file is imported early

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const CLOUD_NAME = process.env.CLOUDINARY_NAME || "";
const API_KEY = process.env.CLOUDINARY_API_KEY || "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.warn("Cloudinary credentials appear missing. Check your .env and dotenv ordering.");
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) throw new Error("No local file path provided to uploadOnCloudinary");
    if (!fs.existsSync(localFilePath)) throw new Error(`Local file not found: ${localFilePath}`);

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "video",
      chunk_size: 6000000,
      timeout: 600000,
    });

    try { fs.unlinkSync(localFilePath); } catch (e) { console.warn("unlink failed:", e); }

    return response;
  } catch (error) {
    console.error("cloudinary.upload error:", error && (error.stack || error.message));
    try { if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath); } catch (e) {}
    throw error;
  }
};

export { uploadOnCloudinary };
