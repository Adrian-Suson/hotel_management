import express from "express";
import db from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const idPictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "..", "..", "assets", "id_pictures");
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

const idPictureUpload = multer({ storage: idPictureStorage });

// Endpoint for fetching the "About Us" section
router.get("/about-us", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about_us LIMIT 1");
    if (rows.length === 0) {
      return res.status(404).json({ error: "About Us section not found" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching About Us section:", error);
    res.status(500).json({ error: "Failed to fetch About Us section" });
  }
});

// Endpoint for updating the "About Us" section
router.put("/about-us", async (req, res) => {
  const { title, description } = req.body;

  try {
    // Check if the About Us section already exists
    const [rows] = await db.query("SELECT * FROM about_us LIMIT 1");

    if (rows.length === 0) {
      // If it doesn't exist, insert a new record
      const [result] = await db.query(
        "INSERT INTO about_us (title, description) VALUES (?, ?)",
        [title, description]
      );
      res.status(201).json({ id: result.insertId, title, description });
    } else {
      // If it exists, update the existing record
      const [result] = await db.query(
        "UPDATE about_us SET title = ?, description = ? WHERE id = ?",
        [title, description, rows[0].id]
      );
      res.status(200).json({ id: rows[0].id, title, description });
    }
  } catch (error) {
    console.error("Error updating About Us section:", error);
    res.status(500).json({ error: "Failed to update About Us section" });
  }
});

export default router;
