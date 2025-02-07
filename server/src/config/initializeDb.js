// initializeDb.js
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const initializeApp = async () => {
  try {
    // Define admin credentials
    const adminUserId = (process.env.ADMIN_USER_ID);
    const adminUser = process.env.USER_NAME;
    const adminPassword = process.env.USER_PASSWORD; 
    const adminRole = process.env.USER_ROLE;

    // Check if the admin user exists and create one if not
    const [users] = await db.query("SELECT * FROM users WHERE userId = ?", [adminUserId]);
    if (users.length === 0) { 
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db.query(
        "INSERT INTO users (userId, username, password, role) VALUES (?, ?, ?, ?)",
        [adminUserId, adminUser, hashedPassword, adminRole] 
      );

      // Create default profile for the admin user
      await db.query(
        "INSERT INTO user_profile (user_id, first_name, last_name, email, phone_number, address, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          adminUserId, 
          "Admin",
          "User",
          `${adminUser}@example.com`,
          "123-456-7890",
          "123 Admin St", 
          "default_profile.jpg",
        ]
      );

      console.log("Admin user and profile created.");
    } else {
      console.log("Admin user already exists or the database is not empty.");
    } 
  } catch (error) {
    console.error("Error setting up the database and admin user:", error);
  }
};

// Initialize the application
initializeApp();
