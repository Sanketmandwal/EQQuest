import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import EmotionSession from "../models/EmotionSession.js";

const router = express.Router();
const upload = multer();

const WORQ_URL = "https://api.worqhat.com/your-endpoint";
const WORQ_KEY = process.env.WORQ_KEY;

// Save frame under sessionId
router.post("/proxy/worqhat/:sessionId", upload.single("file"), async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!req.file) return res.status(400).json({ error: "no file" });

    // Send to Worqhat API
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname || "frame.jpg",
      contentType: req.file.mimetype || "image/jpeg"
    });

    const response = await axios.post(WORQ_URL, form, {
      headers: {
        Authorization: "Bearer " + WORQ_KEY,
        ...form.getHeaders()
      },
      timeout: 20000
    });

    const emotions = response.data.data;

    // ✅ Find or create session
    let session = await EmotionSession.findOne({ sessionId });
    if (!session) {
      session = new EmotionSession({ sessionId, frames: [] });
    }

    // Push new frame into existing session
    session.frames.push({
      emotions,
      timestamp: new Date()
    });

    await session.save();

    res.status(200).json({ message: "Frame saved", emotions });
  } catch (err) {
    console.error("Proxy error:", err?.response?.data || err.message);
    res.status(500).json({ error: "proxy failed" });
  }
});

export default router;
