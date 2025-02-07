import express from "express";
import db from "../config/db.js";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "..", "assets", "Rooms"));
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

// Create Rooms
router.post("/rooms", upload.single("image"), async (req, res) => {
  const { room_number, room_type_id, rate, status_code_id } = req.body;
  const { file } = req;

  if (!file) {
    res
      .status(400)
      .send({ success: false, message: "No image file provided." });
    return;
  }

  const imageName = file.filename;

  try {
    const [result] = await db.query(
      "INSERT INTO rooms (room_number, room_type_id, rate, imageUrl, status_code_id) VALUES (?, ?, ?, ?, ?)",
      [room_number, room_type_id, rate, imageName, status_code_id]
    );
    res.status(201).json({
      success: true,
      message: "Room created successfully.",
      insertedId: result.insertId,
      imageUrl: `/assets/${imageName}`,
    });
  } catch (error) {
    console.error("Room Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during room creation.",
    });
  }
});

// Get all rooms
router.get("/rooms", async (req, res) => {
  try {
    const query = `
      SELECT r.id, r.room_number, r.rate, r.imageUrl,
             rt.name AS room_type, 
             sc.id AS status_id,sc.label AS status, sc.color AS status_color, sc.text_color
      FROM rooms r
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN status_codes sc ON r.status_code_id = sc.id
    `;
    const [rooms] = await db.query(query);
    res.json({
      success: true,
      rooms: rooms.map((room) => ({
        ...room,
        color: room.status_color,
        text_color: room.text_color,
      })),
    });
  } catch (error) {
    console.error("Get Rooms Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching rooms.",
    });
  }
});

// Get room by ID
router.get("/rooms/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT r.id, r.room_number, r.rate, r.imageUrl,
             rt.name AS room_type, 
             sc.id AS status_code_id, sc.label AS status, sc.color AS status_color, sc.text_color
      FROM rooms r
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN status_codes sc ON r.status_code_id = sc.id
      WHERE r.id = ?
    `;
    const [rooms] = await db.query(query, [id]);
    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }
    const room = rooms[0];
    res.json({
      success: true,
      room: {
        id: room.id,
        room_number: room.room_number,
        rate: room.rate,
        imageUrl: room.imageUrl,
        room_type: room.room_type,
        status_code_id: room.status_code_id,
        status: room.status,
        color: room.status_color,
        text_color: room.text_color,
      },
    });
  } catch (error) {
    console.error("Get Room Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the room.",
    });
  }
});

// Update a room by ID
router.put("/rooms/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { room_number, room_type, rate, status } = req.body;
  const { file } = req;

  try {
    console.log("Received data:", req.body);
    console.log("Received file:", file);

    // Fetch the existing room data
    const [rows] = await db.query("SELECT * FROM rooms WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found." });
    }

    const existingRoom = rows[0];

    // Fetch the room_type_id based on the room_type name
    let room_type_id;
    if (room_type) {
      const [roomTypeRows] = await db.query(
        "SELECT id FROM room_types WHERE name = ?",
        [room_type]
      );
      if (roomTypeRows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Room type not found." });
      }
      room_type_id = roomTypeRows[0].id;
      console.log("Room type ID:", room_type_id);
    } else {
      room_type_id = existingRoom.room_type_id;
    }

    // Fetch the status_code_id based on the status label
    let status_code_id;
    if (status) {
      const [statusRows] = await db.query(
        "SELECT id FROM status_codes WHERE label = ?",
        [status]
      );
      if (statusRows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Status not found." });
      }
      status_code_id = statusRows[0].id;
      console.log("Status code ID:", status_code_id);
    } else {
      status_code_id = existingRoom.status_code_id;
    }

    // Merge the new data with the existing data
    const updatedRoom = {
      room_number: room_number || existingRoom.room_number,
      room_type_id: room_type_id,
      rate: rate || existingRoom.rate,
      imageUrl: file ? file.filename : existingRoom.imageUrl,
      status_code_id: status_code_id,
    };

    console.log("Updated Room Data:", updatedRoom);

    await db.query(
      "UPDATE rooms SET room_number = ?, room_type_id = ?, rate = ?, imageUrl = ?, status_code_id = ? WHERE id = ?",
      [
        updatedRoom.room_number,
        updatedRoom.room_type_id,
        updatedRoom.rate,
        updatedRoom.imageUrl,
        updatedRoom.status_code_id,
        id,
      ]
    );

    // Delete the old image if a new image is uploaded
    if (file && existingRoom.imageUrl) {
      fs.unlink(
        path.join(
          __dirname,
          "..",
          "..",
          "assets",
          "Rooms",
          existingRoom.imageUrl
        ),
        (err) => {
          if (err) {
            console.error("Error deleting old image:", err);
          }
        }
      );
    }

    res.json({
      success: true,
      message: "Room updated successfully.",
      imageUrl: `/assets/${updatedRoom.imageUrl}`,
    });
  } catch (error) {
    console.error("Update Room Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating room.",
    });
  }
});

// Update room status by ID
router.put("/rooms/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status_code_id } = req.body;

  try {
    await db.query("UPDATE rooms SET status_code_id = ? WHERE id = ?", [
      status_code_id,
      id,
    ]);
    res.json({ success: true, message: "Room status updated successfully." });
  } catch (error) {
    console.error("Update Room Status Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating room status.",
    });
  }
});

// Delete a room by ID
router.delete("/rooms/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the image path before deleting the room
    const [rows] = await db.query("SELECT imageUrl FROM rooms WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found." });
    }

    const imageUrl = rows[0].imageUrl;

    // Delete the room record from the database
    const [result] = await db.query("DELETE FROM rooms WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found." });
    }

    // Delete the image file from the filesystem
    if (imageUrl) {
      fs.unlink(
        path.join(__dirname, "..", "..", "assets", "Rooms", imageUrl),
        (err) => {
          if (err) {
            console.error("Error deleting image:", err);
          }
        }
      );
    }

    res.json({ success: true, message: "Room deleted successfully." });
  } catch (error) {
    console.error("Delete Room Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting room.",
    });
  }
});

// Endpoint to get status options
router.get("/status", async (req, res) => {
  try {
    const [statusOptions] = await db.query("SELECT * FROM status_codes");
    res.json({ success: true, statusOptions });
  } catch (error) {
    console.error("Get Status Options Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching status options.",
    });
  }
});

// Endpoint to get room types
router.get("/room-types", async (req, res) => {
  try {
    const [roomTypes] = await db.query("SELECT id, name FROM room_types");
    res.json({ success: true, roomTypes });
  } catch (error) {
    console.error("Get Room Types Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching room types.",
    });
  }
});

// Add new room type
router.post("/room-types", async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO room_types (name) VALUES (?)",
      [name]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error("Failed to add room type:", error);
    res.status(500).json({ error: "Failed to add room type" });
  }
});

// Add new status code
router.post("/status", async (req, res) => {
  const { code, label, color, text_color } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO status_codes ( code, label, color, text_color) VALUES ( ?, ?, ?, ?)",
      [code, label, color, text_color]
    );
    res
      .status(201)
      .json({ id: result.insertId, code, label, color, text_color });
  } catch (error) {
    console.error("Failed to add status code:", error);
    res.status(500).json({ error: "Failed to add status code" });
  }
});

router.delete("/room-types/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM room_types WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Room type not found" });
    }
    res.json({ success: true, message: "Room type deleted successfully" });
  } catch (error) {
    console.error("Failed to delete room type:", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this room type because it is referenced by one or more rooms.",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to delete room type" });
  }
});

// Endpoint to delete a status code by ID
router.delete("/status/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM status_codes WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Status code not found" });
    }
    res.json({ success: true, message: "Status code deleted successfully" });
  } catch (error) {
    console.error("Failed to delete status code:", error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this status code because it is referenced by one or more rooms.",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to delete status code" });
  }
});

export default router;
