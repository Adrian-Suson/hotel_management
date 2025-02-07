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
    payment_method = null,
    total_service_charges = null,
    discount_percentage = null,
    discount_name = null,
    deposit_amount = null,
  } = req.body;

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    if (!stayRecordId || amount === undefined || amount === null) {
      throw new Error("Missing required fields: stayRecordId or amount.");
    }

    const [stayRecordData] = await connection.query(
      "SELECT * FROM stay_records WHERE id = ?",
      [stayRecordId]
    );

    if (stayRecordData.length === 0) {
      throw new Error("Stay record not found.");
    }

    const stayRecord = stayRecordData[0];

    await connection.query(
      "INSERT INTO transaction_history (room_id, guest_id, check_in, check_out, adults, kids, amount_paid, total_service_charges, discount_percentage, discount_name, payment_method, payment_date, deposit_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)",
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

    await connection.query("DELETE FROM services WHERE stay_record_id = ?", [
      stayRecordId,
    ]);

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

router.get("/transaction_history", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        transaction_history.id,
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
        transaction_history.check_in,
        transaction_history.check_out,
        transaction_history.adults,
        transaction_history.kids,
        transaction_history.amount_paid,
        transaction_history.total_service_charges,
        transaction_history.discount_percentage,
        transaction_history.discount_name,
        transaction_history.payment_method,
        transaction_history.payment_date,
        transaction_history.deposit_amount AS deposit,
        transaction_history.adults + transaction_history.kids AS guestNumber
      FROM transaction_history
      JOIN guests ON transaction_history.guest_id = guests.id
      JOIN rooms ON transaction_history.room_id = rooms.id
      JOIN room_types ON rooms.room_type_id = room_types.id
      JOIN status_codes sc ON rooms.status_code_id = sc.id
    `);

    res.json({ success: true, transaction_history: rows });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching transaction history.",
    });
  }
});

router.get("/transaction_history/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT
        transaction_history.id,
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
        transaction_history.check_in,
        transaction_history.check_out,
        transaction_history.adults,
        transaction_history.kids,
        transaction_history.amount_paid,
        transaction_history.total_service_charges,
        transaction_history.discount_percentage,
        transaction_history.discount_name,
        transaction_history.payment_method,
        transaction_history.payment_date, 
        transaction_history.adults + transaction_history.kids AS guestNumber
      FROM transaction_history
      JOIN guests ON transaction_history.guest_id = guests.id
      JOIN rooms ON transaction_history.room_id = rooms.id
      JOIN room_types ON rooms.room_type_id = room_types.id
      JOIN status_codes sc ON rooms.status_code_id = sc.id
      WHERE transaction_history.id = ?
    `,
      [id]
    );

    if (rows.length) {
      res.json({ success: true, transaction: rows[0] });
    } else {
      res.status(404).json({
        success: false,
        message: "No record found with the given ID.",
      });
    }
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching the transaction.",
    });
  }
});

router.get("/stay_records/guest/:guestId/history", async (req, res) => {
  const { guestId } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT
        transaction_history.id,
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
        transaction_history.check_in,
        transaction_history.check_out,
        transaction_history.adults,
        transaction_history.kids,
        transaction_history.amount_paid,
        transaction_history.total_service_charges,
        transaction_history.discount_percentage,
        transaction_history.discount_name,
        transaction_history.payment_method,
        transaction_history.payment_date,
        transaction_history.adults + transaction_history.kids AS guestNumber
      FROM transaction_history
      JOIN guests ON transaction_history.guest_id = guests.id
      JOIN rooms ON transaction_history.room_id = rooms.id
      JOIN room_types ON rooms.room_type_id = room_types.id
      JOIN status_codes sc ON rooms.status_code_id = sc.id
      WHERE transaction_history.guest_id = ?
      `,
      [guestId]
    );

    res.json({ success: true, history_records: rows });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching transaction history.",
    });
  }
});

router.get("/room_usage", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        rooms.room_number,
        COUNT(transaction_history.id) AS usage_count
      FROM rooms
      LEFT JOIN transaction_history ON rooms.id = transaction_history.room_id
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
