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

router.post("/stay_records/:stayRecordId/payment", async (req, res) => {
  const { stayRecordId } = req.params;
  const {
    amount,
    payment_method = null, // Allow null
    total_service_charges = null, // Allow null
    discount_percentage = null, // Allow null
    discount_name = null, // Allow null
    deposit_amount = null, // Allow null
  } = req.body;

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if the stayRecordId and amount are provided
    if (!stayRecordId || amount === undefined || amount === null) {
      throw new Error("Missing required fields: stayRecordId or amount.");
    }

    // Fetch stay record data
    const [stayRecordData] = await connection.query(
      "SELECT * FROM stay_records WHERE id = ?",
      [stayRecordId]
    );

    if (stayRecordData.length === 0) {
      throw new Error("Stay record not found.");
    }

    const stayRecord = stayRecordData[0];

    // Insert into stay_records_history
    await connection.query(
      "INSERT INTO stay_records_history (room_id, guest_id, check_in, check_out, adults, kids, amount_paid, total_service_charges, discount_percentage, discount_name, payment_method, payment_date, deposit_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)",
      [
        stayRecord.room_id,
        stayRecord.guest_id,
        stayRecord.check_in,
        stayRecord.check_out,
        stayRecord.adults,
        stayRecord.kids,
        amount,
        total_service_charges,
        discount_percentage,
        discount_name,
        payment_method,
        deposit_amount,
      ]
    );

    // Delete related services
    await connection.query("DELETE FROM services WHERE stay_record_id = ?", [
      stayRecordId,
    ]);

    // Delete the stay record from stay_records
    await connection.query("DELETE FROM stay_records WHERE id = ?", [
      stayRecordId,
    ]);

    await connection.commit();
    res.json({
      success: true,
      message:
        "Payment processed and stay record transferred to history successfully.",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error(
      "Failed to process payment and transfer stay record:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to process payment and transfer stay record.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Route to fetch stay records history data
router.get("/stay_records_history", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        stay_records_history.id,
        guests.id AS guest_id,
        CONCAT(guests.first_name, ' ', guests.last_name) AS guestName,
        guests.email AS guestEmail,
        guests.phone AS guestPhone,
        guests.id_picture AS guestIdPicture,
        rooms.room_number,
        rooms.rate AS roomRate,
        rooms.imageUrl AS roomImageUrl,
        room_types.name AS roomTypeName,
        sc.label AS status,
        sc.color AS bgcolor,
        sc.text_color,
        stay_records_history.check_in,
        stay_records_history.check_out,
        stay_records_history.adults,
        stay_records_history.kids,
        stay_records_history.amount_paid,
        stay_records_history.total_service_charges,
        stay_records_history.discount_percentage,
        stay_records_history.discount_name,
        stay_records_history.payment_method,
        stay_records_history.payment_date,
        stay_records_history.deposit_amount AS deposit,
        stay_records_history.adults + stay_records_history.kids AS guestNumber
      FROM stay_records_history
      JOIN guests ON stay_records_history.guest_id = guests.id
      JOIN rooms ON stay_records_history.room_id = rooms.id
      JOIN room_types ON rooms.room_type_id = room_types.id
      JOIN status_codes sc ON rooms.status_code_id = sc.id
    `);

    res.json({ success: true, stay_records_history: rows });
  } catch (error) {
    console.error("Error fetching stay records history:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching stay records history.",
    });
  }
});

// Route to fetch a specific stay record history by ID
router.get("/stay_records_history/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT
        stay_records_history.id,
        guests.id AS guest_id,
        CONCAT(guests.first_name, ' ', guests.last_name) AS guestName,
        guests.email AS guestEmail,
        guests.phone AS guestPhone,
        guests.id_picture AS guestIdPicture, 
        rooms.room_number,
        rooms.rate AS roomRate,
        rooms.imageUrl AS roomImageUrl,
        room_types.name AS roomTypeName,
        sc.label AS status,
        sc.color AS bgcolor,
        sc.text_color,
        stay_records_history.check_in,
        stay_records_history.check_out,
        stay_records_history.adults,
        stay_records_history.kids,
        stay_records_history.amount_paid,
        stay_records_history.total_service_charges,
        stay_records_history.discount_percentage,
        stay_records_history.discount_name,
        stay_records_history.payment_method,
        stay_records_history.payment_date, 
        stay_records_history.adults + stay_records_history.kids AS guestNumber
      FROM stay_records_history
      JOIN guests ON stay_records_history.guest_id = guests.id
      JOIN rooms ON stay_records_history.room_id = rooms.id
      JOIN room_types ON rooms.room_type_id = room_types.id
      JOIN status_codes sc ON rooms.status_code_id = sc.id
      WHERE stay_records_history.id = ?
    `,
      [id]
    );

    if (rows.length) {
      res.json({ success: true, stay_record: rows[0] });
    } else {
      res.status(404).json({
        success: false,
        message: "No record found with the given ID.",
      });
    }
  } catch (error) {
    console.error("Error fetching stay record by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching the stay record.",
    });
  }
});

// Route to fetch stay records history data for a specific guest
router.get("/stay_records/guest/:guestId/history", async (req, res) => {
  const { guestId } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT
        stay_records_history.id,
        guests.id AS guest_id,
        CONCAT(guests.first_name, ' ', guests.last_name) AS guestName,
        guests.email AS guestEmail,
        guests.phone AS guestPhone,
        guests.id_picture AS guestIdPicture,
        rooms.room_number,
        rooms.rate AS roomRate,
        rooms.imageUrl AS roomImageUrl,
        room_types.name AS roomTypeName,
        sc.label AS status,
        sc.color AS bgcolor,
        sc.text_color,
        stay_records_history.check_in,
        stay_records_history.check_out,
        stay_records_history.adults,
        stay_records_history.kids,
        stay_records_history.amount_paid,
        stay_records_history.total_service_charges,
        stay_records_history.discount_percentage,
        stay_records_history.discount_name,
        stay_records_history.payment_method,
        stay_records_history.payment_date,
        stay_records_history.adults + stay_records_history.kids AS guestNumber
      FROM stay_records_history
      JOIN guests ON stay_records_history.guest_id = guests.id
      JOIN rooms ON stay_records_history.room_id = rooms.id
      JOIN room_types ON rooms.room_type_id = room_types.id
      JOIN status_codes sc ON rooms.status_code_id = sc.id
      WHERE stay_records_history.guest_id = ?
      `,
      [guestId]
    );

    res.json({ success: true, history_records: rows });
  } catch (error) {
    console.error("Error fetching stay records history:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching stay records history.",
    });
  }
});

router.get("/room_usage", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        rooms.room_number,
        COUNT(stay_records_history.id) AS usage_count
      FROM rooms
      LEFT JOIN stay_records_history ON rooms.id = stay_records_history.room_id
      GROUP BY rooms.room_number
      ORDER BY usage_count DESC
    `);

    const formattedRows = rows.map((row) => ({
      ...row,
      usage_count: parseInt(row.usage_count, 10),
    }));

    res.json({ success: true, room_usage: formattedRows });
  } catch (error) {
    console.error("Error fetching room usage data:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching room usage data.",
    });
  }
});

export default router;
