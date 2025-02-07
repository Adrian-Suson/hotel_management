import express from "express";
import db from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Setup storage for ID pictures
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

// Endpoint to get all guests
router.get("/guests", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM guests");
    res.json({ success: true, guests: rows });
  } catch (error) {
    console.error("Error fetching guests:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching guests.",
    });
  }
});

// Endpoint to add a new guest
router.post("/guests", upload.single("id_picture"), async (req, res) => {
  const { firstName, lastName, email, phoneNumber } = req.body;
  const idPicturePath = req.file ? req.file.path.replace(/\\/g, "/") : null;

  try {
    const [result] = await db.query(
      "INSERT INTO guests (first_name, last_name, email, phone, id_picture) VALUES (?, ?, ?, ?, ?)",
      [firstName, lastName, email, phoneNumber, idPicturePath]
    );

    res.json({
      success: true,
      message: "Guest added successfully.",
      guestId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding guest:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while adding guest.",
    });
  }
});

// Endpoint to update guest information
router.put("/guests/:id", upload.single("id_picture"), async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phoneNumber } = req.body;
  const idPicturePath = req.file ? req.file.path.replace(/\\/g, "/") : null;

  try {
    // Fetch existing guest details
    const [guest] = await db.query("SELECT * FROM guests WHERE id = ?", [id]);

    if (guest.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Guest not found." });
    }

    const existingGuest = guest[0];

    // Update query with conditional image handling
    const query = idPicturePath
      ? "UPDATE guests SET first_name = ?, last_name = ?, email = ?, phone = ?, id_picture = ? WHERE id = ?"
      : "UPDATE guests SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?";
    const params = idPicturePath
      ? [firstName, lastName, email, phoneNumber, idPicturePath, id]
      : [firstName, lastName, email, phoneNumber, id];

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Guest not found." });
    }

    // Delete the old image if a new image is uploaded
    if (idPicturePath && existingGuest.id_picture) {
      fs.unlink(
        path.join(__dirname, "..", "..", existingGuest.id_picture),
        (err) => {
          if (err) {
            console.error("Error deleting old ID picture:", err);
          }
        }
      );
    }

    res.json({ success: true, message: "Guest updated successfully." });
  } catch (error) {
    console.error("Error updating guest:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while updating guest.",
    });
  }
});

// Endpoint to get a single guest by ID
router.get("/guests/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM guests WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Guest not found." });
    }
    res.json({ success: true, guest: rows[0] });
  } catch (error) {
    console.error("Error fetching guest:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching guest: " + error.message,
    });
  }
});

// Endpoint to delete a guest by ID
router.delete("/guests/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the ID picture path before deleting the guest
    const [rows] = await db.query(
      "SELECT id_picture FROM guests WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Guest not found." });
    }

    const idPicturePath = rows[0].id_picture;

    // Delete the guest record from the database
    const [result] = await db.query("DELETE FROM guests WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Guest not found." });
    }

    // Delete the ID picture file from the filesystem
    if (idPicturePath) {
      fs.unlink(path.join(__dirname, "..", "..", idPicturePath), (err) => {
        if (err) {
          console.error("Error deleting ID picture:", err);
        }
      });
    }

    res.json({ success: true, message: "Guest deleted successfully." });
  } catch (error) {
    console.error("Error deleting guest:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while deleting guest.",
    });
  }
});

// Endpoint to check if email exists
router.get("/guests/email-exists/:id", async (req, res) => {
  const email = decodeURIComponent(req.query.email);
  const id = req.params.id;

  try {
    // First, fetch the current email of the guest by ID
    const [current] = await db.query("SELECT email FROM guests WHERE id = ?", [
      id,
    ]);

    // If the current email matches the new email, return that there is no conflict
    if (current.length > 0 && current[0].email === email) {
      res.json({ exists: false });
      return;
    }

    // Check if the email exists for any other guest
    const [rows] = await db.query(
      "SELECT id FROM guests WHERE email = ? AND id != ?",
      [email, id]
    );

    // Respond based on whether any other guest uses this email
    res.json({ exists: rows.length > 0 });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while checking email.",
    });
  }
});

router.get("/guests/:id", async (req, res) => {
  const guestId = req.params.id;

  try {
    const [rows] = await db.query("SELECT * FROM guests WHERE id = ?", [
      guestId,
    ]);

    if (rows.length > 0) {
      res.json({ success: true, guest: rows[0] });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error("Error fetching guest by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching guest by ID.",
    });
  }
});

export default router;
