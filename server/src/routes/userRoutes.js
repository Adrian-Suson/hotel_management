import express from "express";
import db from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Setup storage for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "..", "..", "assets", "ProfilePic");
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
const jwtSecretKey = process.env.TOKEN_SECRET;

// Endpoint to log in a user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      // User does not exist
      return res
        .status(404)
        .json({ success: false, message: "Account does not exist" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        jwtSecretKey,
        { expiresIn: "1h" }
      );
      res.json({
        success: true,
        token,
        role: user.role,
        userId: user.userId,
      });
    } else {
      // Password does not match
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
});

// Endpoint to register a new user
router.post("/register", async (req, res) => {
  const { id, username, password, role } = req.body;

  if (!id || !username || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "ID, username, password, and role are required.",
    });
  }

  try {
    const [existingUser] = await db.query(
      "SELECT userId FROM users WHERE userId = ?",
      [id]
    );
    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "User ID already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const baseEmail = `${username}@example.com`; // Base email
    const imageName = "default_profile.jpg"; // Set default profile picture

    // Check if email already exists and generate a new one if necessary
    let email = baseEmail;
    let emailExists = true;
    let counter = 1;

    // Loop to ensure email uniqueness
    while (emailExists) {
      const [existingEmail] = await db.query(
        "SELECT email FROM user_profile WHERE email = ?",
        [email]
      );

      if (existingEmail.length > 0) {
        // If the email exists, append a number and check again
        email = `${username}${counter}@example.com`;
        counter++;
      } else {
        emailExists = false;
      }
    }

    // Insert new user into the users table
    await db.query(
      "INSERT INTO users (userId, username, password, role) VALUES (?, ?, ?, ?)",
      [id, username, hashedPassword, role]
    );

    // Insert default profile for the new user with unique email and default image name
    await db.query(
      "INSERT INTO user_profile (user_id, first_name, last_name, email, phone_number, address, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        "Default First Name",
        "Default Last Name",
        email, // Use the unique email
        "123-456-7890",
        "123 Default St, City",
        imageName,
      ]
    );

    res.status(201).json({
      success: true,
      message: "User and profile registered successfully.",
      email: email,
      imageName: imageName,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration.",
    });
  }
});


// Endpoint to get all users
router.get("/users", async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users");
    res.json({ success: true, users });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching users.",
    });
  }
});

// Endpoint to get user by ID
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await db.query("SELECT * FROM users WHERE userId = ?", [id]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    res.json({ success: true, user: user[0] });
  } catch (error) {
    console.error("Get User by ID Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the user.",
    });
  }
});

// Endpoint to update a user by ID
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  try {
    const [existingUser] = await db.query("SELECT id FROM users WHERE id = ?", [
      id,
    ]);
    if (existingUser.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : existingUser[0].password;

    await db.query(
      "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
      [username, hashedPassword, role, id]
    );
    res.json({ success: true, message: "User updated successfully." });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating user.",
    });
  }
});

// Endpoint to delete a user by ID
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [existingUser] = await db.query("SELECT id FROM users WHERE id = ?", [
      id,
    ]);
    if (existingUser.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    await db.query("DELETE FROM users WHERE id = ?", [id]);
    await db.query("DELETE FROM user_profile WHERE user_id = ?", [id]);
    res.json({
      success: true,
      message: "User and profile deleted successfully.",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting user and profile.",
    });
  }
});

// Endpoint to get user profile by ID
router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [profile] = await db.query(
      "SELECT * FROM user_profile WHERE user_id = ?",
      [userId]
    );
    if (profile.length > 0) {
      res.json({ success: true, profile: profile[0] });
    } else {
      res.status(404).json({ success: false, message: "Profile not found." });
    }
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the profile.",
    });
  }
});

router.put(
  "/profile/:userId",
  upload.single("profilePic"),
  async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, email, phoneNumber, address } = req.body;
    const imageName = req.file ? req.file.filename : undefined;

    try {
      const [profile] = await db.query(
        "SELECT user_id, image_url FROM user_profile WHERE user_id = ?",
        [userId]
      );

      if (profile.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Profile not found." });
      }

      const oldImage = profile[0].image_url;

      let query =
        "UPDATE user_profile SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address = ?";
      const params = [firstName, lastName, email, phoneNumber, address];

      if (imageName) {
        query += ", image_url = ?";
        params.push(imageName);
      }

      query += " WHERE user_id = ?";
      params.push(userId);

      await db.query(query, params);

      // Delete the old image if a new image is uploaded
      if (imageName && oldImage && oldImage !== "default_profile.jpg") {
        fs.unlink(
          path.join(__dirname, "..", "..", "assets", "ProfilePic", oldImage),
          (err) => {
            if (err) {
              console.error("Error deleting old image:", err);
            }
          }
        );
      }

      res.json({
        success: true,
        message: "Profile updated successfully.",
        imageName,
      });
    } catch (error) {
      console.error("Update Profile Error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating the profile.",
      });
    }
  }
);

// Endpoint to delete a user and their profile by user ID
router.delete("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [existingUser] = await db.query(
      "SELECT userId FROM users WHERE userId = ?",
      [userId]
    );
    if (existingUser.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Fetch the image URL before deleting the profile
    const [profile] = await db.query(
      "SELECT image_url FROM user_profile WHERE user_id = ?",
      [userId]
    );

    if (profile.length > 0) {
      const imageUrl = profile[0].image_url;

      // Delete the user profile from the database
      await db.query("DELETE FROM user_profile WHERE user_id = ?", [userId]);

      // Delete the image file from the filesystem
      if (imageUrl && imageUrl !== "default_profile.jpg") {
        fs.unlink(
          path.join(__dirname, "..", "..", "assets", "ProfilePic", imageUrl),
          (err) => {
            if (err) {
              console.error("Error deleting image:", err);
            }
          }
        );
      }
    }

    await db.query("DELETE FROM users WHERE userId = ?", [userId]);

    res.json({
      success: true,
      message: "User and profile deleted successfully.",
    });
  } catch (error) {
    console.error("Delete User and Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting user and profile.",
    });
  }
});

router.post("/user_log", async (req, res) => {
  const { userId, action } = req.body;

  if (!userId || !action) {
    return res
      .status(400)
      .json({ success: false, message: "User ID and action are required." });
  }

  try {
    await db.query("INSERT INTO user_log (user_id, action) VALUES (?, ?)", [
      userId,
      action,
    ]);
    res
      .status(201)
      .json({ success: true, message: "Log entry created successfully." });
  } catch (error) {
    console.error("Log Entry Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while logging the action.",
    });
  }
});

router.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [user] = await db.query(
      "SELECT username, role FROM users WHERE userId = ?",
      [userId]
    );
    if (user.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    res.json({ success: true, user: user[0] });
  } catch (error) {
    console.error("Fetch User Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the user.",
    });
  }
});

// Endpoint to get user logs by user ID
router.get("/user_log/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [logs] = await db.query(
      "SELECT log_id, action, action_time FROM user_log WHERE user_id = ? ORDER BY action_time DESC",
      [userId]
    );
    res.json({ success: true, logs });
  } catch (error) {
    console.error("Fetch User Logs Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching user logs.",
    });
  }
});

// Endpoint to update user login info
router.put("/update_login/:userId", async (req, res) => {
  const { userId } = req.params;
  const { username, password } = req.body;

  try {
    const [existingUser] = await db.query(
      "SELECT userId, password FROM users WHERE userId = ?",
      [userId]
    );
    if (existingUser.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const user = existingUser[0];
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : user.password;

    const query =
      "UPDATE users SET username = ?, password = ? WHERE userId = ?";
    const params = [username, hashedPassword, userId];

    await db.query(query, params);

    res.json({ success: true, message: "Login info updated successfully." });
  } catch (error) {
    console.error("Update Login Info Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating login info.",
    });
  }
});

// Endpoint to check if a username already exists
router.post("/check_username", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ success: false, message: "Username is required." });
  }

  try {
    const [existingUser] = await db.query(
      "SELECT username FROM users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(200).json({ success: true, exists: true });
    } else {
      return res.status(200).json({ success: true, exists: false });
    }
  } catch (error) {
    console.error("Check Username Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while checking username.",
    });
  }
});

export default router;
