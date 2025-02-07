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

// Route to add service to a stay record
router.post("/stay_records/:stayRecordId/services", async (req, res) => {
  const { stayRecordId } = req.params;
  const { service_list_id, price } = req.body;

  try {
    await db.query(
      "INSERT INTO services (service_list_id, price, stay_record_id) VALUES (?, ?, ?)",
      [service_list_id, price, stayRecordId]
    );

    const [services] = await db.query(
      "SELECT * FROM services ORDER BY id DESC LIMIT 1"
    );

    const service = services[0];
    res.status(201).json({ success: true, service });
  } catch (error) {
    console.error("Failed to add service:", error);
    res.status(500).json({ success: false, message: "Failed to add service." });
  }
});

// Route to fetch services for a stay record
router.get("/stay_records/:stayRecordId/services", async (req, res) => {
  const { stayRecordId } = req.params;

  try {
    const [services] = await db.query(
      "SELECT services.*, service_list.name FROM services JOIN service_list ON services.service_list_id = service_list.id WHERE stay_record_id = ?",
      [stayRecordId]
    );
    res.json({ success: true, services });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch services." });
  }
});

// Route to add a new service to the service list
router.post("/service_list", async (req, res) => {
  const { name, base_price, description } = req.body;

  try {
    await db.query(
      "INSERT INTO service_list (name, base_price, description) VALUES (?, ?, ?)",
      [name, base_price, description]
    );

    const [services] = await db.query(
      "SELECT * FROM service_list ORDER BY id DESC LIMIT 1"
    );

    const service = services[0];
    res.status(201).json({ success: true, service });
  } catch (error) {
    console.error("Failed to add service to the list:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add service to the list." });
  }
});

// Route to fetch all services from the service list
router.get("/service_list", async (req, res) => {
  try {
    const [services] = await db.query("SELECT * FROM service_list");
    res.json({ success: true, services });
  } catch (error) {
    console.error("Failed to fetch service list:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch service list." });
  }
});

// Route to update a service in the service list
router.put("/service_list/:serviceId", async (req, res) => {
  const { serviceId } = req.params;
  const { name, base_price, description } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE service_list SET name = ?, base_price = ?, description = ? WHERE id = ?",
      [name, base_price, description, serviceId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found." });
    }

    const [services] = await db.query(
      "SELECT * FROM service_list WHERE id = ?",
      [serviceId]
    );
    const service = services[0];

    res.json({ success: true, service });
  } catch (error) {
    console.error("Failed to update service in the list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update service in the list.",
    });
  }
});

// Route to delete a service from the service list
router.delete("/service_list/:serviceId", async (req, res) => {
  const { serviceId } = req.params;

  try {
    const [result] = await db.query("DELETE FROM service_list WHERE id = ?", [
      serviceId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found." });
    }

    res.json({
      success: true,
      message: "Service deleted from the list successfully.",
    });
  } catch (error) {
    console.error("Failed to delete service from the list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete service from the list.",
    });
  }
});

// Route to delete a service from a stay record
router.delete(
  "/stay_records/:stayRecordId/services/:serviceId",
  async (req, res) => {
    const { stayRecordId, serviceId } = req.params;

    try {
      const [result] = await db.query(
        "DELETE FROM services WHERE stay_record_id = ? AND id = ?",
        [stayRecordId, serviceId]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Service not found." });
      }

      res.json({
        success: true,
        message: "Service deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete service:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete service.",
      });
    }
  }
);

export default router;
