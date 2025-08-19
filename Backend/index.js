import express from 'express'
import cors from 'cors'
import connectDB from './services/mongo.js'
import dotenv from 'dotenv';
dotenv.config()

import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';

const upload = multer();
const app = express();
app.use(cors());
connectDB().catch(err => console.error('DB connection error:', err));



const PORT = process.env.PORT || 3001;
const WORQ_URL = "https://api.worqhat.com/flows/file/350326ce-22b0-4fed-b77b-0f748d81218d";
const WORQ_KEY = 'wh_meh6avuwhYmsbR6DxTWAXfNA4DNXHk5LgJ9IZFveti';

if (!WORQ_KEY) {
  console.warn("Warning: WORQHAT_KEY not set in .env — proxy won't function until set.");
}

app.post("/api/proxy/worqhat", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no file" });

    const form = new FormData();
    form.append("file", req.file.buffer, { filename: req.file.originalname || "frame.jpg", contentType: req.file.mimetype || "image/jpeg" });

    const response = await axios.post(WORQ_URL, form, {
      headers: {
        Authorization: "Bearer " + WORQ_KEY,
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 20000,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Proxy error:", err?.response?.data || err.message || err);
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { error: "proxy failed" };
    res.status(status).json(data);
  }
});

app.listen(PORT, () => console.log("Worqhat proxy listening on port", PORT));
