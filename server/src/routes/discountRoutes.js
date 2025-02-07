import express from "express";
import db from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const storage = multer.diskStorage({
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

const upload = multer({ storage: storage });


// Route to fetch all discounts
router.get("/discounts", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM discounts");
    res.json({ success: true, discounts: rows });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching discounts.",
    });
  }
});

// Route to create a new discount
router.post("/discounts", async (req, res) => {
  const { name, percentage } = req.body;

  if (!name || percentage === undefined) {
    return res.status(400).json({
      success: false,
      message: "Name and percentage are required.",
    });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO discounts (name, percentage) VALUES (?, ?)",
      [name, percentage] 
    );

    if (!result.insertId) {
      throw new Error("Failed to create discount.");
    }

    res.json({
      success: true,
      message: "Discount created successfully.",
      discountId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while creating discount.",
    });
  }
});

// Route to delete a discount by ID
router.delete("/discounts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM discounts WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Discount not found." });
    }

    res.json({
      success: true,
      message: "Discount deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while deleting discount.",
    });
  }
});


export default router;
