import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import "dotenv/config";

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage (no disk write)
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload — Upload image to Cloudinary
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "biodex",
          resource_type: "image",
          transformation: [
            { width: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
