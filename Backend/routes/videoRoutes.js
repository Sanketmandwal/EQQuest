// routes/videos.js
import express from "express";
import fs from "fs";
import upload from "../middlewares/multer.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
const videorouter = express.Router();
// routes/videos.js


videorouter.post("/upload-video", upload.single("video"), async (req, res) => {
  try {
    console.log("POST /api/upload-video called");
    console.log("req.file:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : null);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Use field name 'video'." });
    }

    const localPath = req.file.path;
    if(!fs.existsSync(localPath)) {
      console.error("Temp file not found at path:", localPath);
      return res.status(500).json({ error: "Temporary file missing on server." });
    }

    const result = await uploadOnCloudinary(localPath); // will throw on failure

    // success
    console.log("Cloudinary upload success:", { public_id: result.public_id, secure_url: result.secure_url });
    return res.status(200).json({
      url: result.secure_url || result.url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      bytes: result.bytes,
      raw: result,
    });
  } catch (err) {
    console.error("Upload route error:", err && (err.stack || err.message));
    // Send a clear message back to client for debugging (safe: no secrets)
    return res.status(500).json({ error: "Cloudinary upload failed", message: err.message || String(err) });
  }
});

export default videorouter;
