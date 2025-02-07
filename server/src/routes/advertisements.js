import express from "express";
import db from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const adStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "..", "..", "assets", "Advertisements");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const date = new Date();
    const datePrefix = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${datePrefix}-${file.originalname}`;
    cb(null, filename);
  },
});

const adUpload = multer({ storage: adStorage });

router.post("/upload-ad", adUpload.single("adImage"), async (req, res) => {
  const { title, description } = req.body;
  const imageUrl = req.file ? `${req.file.filename}` : null;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image is required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO ads (title, description, image_url) VALUES (?, ?, ?)",
      [title, description, imageUrl]
    );
    res.status(201).json({ id: result.insertId, title, description, imageUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload advertisement" });
  }
});

router.get("/ads", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM ads ORDER BY id ASC");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch advertisements" });
  }
});

router.delete("/ad/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT image_url FROM ads WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Advertisement not found" });
    }

    const adImage = rows[0].image_url;
    const imagePath = path.join(
      __dirname,
      "..",
      "..",
      "assets",
      "Advertisements",
      adImage
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    const [result] = await db.query("DELETE FROM ads WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Advertisement not found" });
    }

    res.status(200).json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete advertisement" });
  }
});

export default router;
