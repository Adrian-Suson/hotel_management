import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { networkInterfaces } from "os";
import userRoutes from "./routes/userRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import roomRoutes from "./routes/roomsRoutes.js";
import reservationRoutes from "./routes/reservationsRoutes.js";
import stayRecordRoutes from "./routes/stayRecordRoute.js";
import historyRoutes from "./routes/historyRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
import aboutUsRoutes from "./routes/aboutUs.js";
import advertisementsRoutes from "./routes/advertisements.js";
import seviceRoutes from "./routes/services.js";
import "./config/initializeDb.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


// Middleware
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// API Routes
app.use("/", userRoutes);
app.use("/", roomRoutes);
app.use("/", reservationRoutes);
app.use("/", stayRecordRoutes);
app.use("/", guestRoutes);
app.use("/", historyRoutes);
app.use("/", discountRoutes);
app.use("/", aboutUsRoutes);
app.use("/", advertisementsRoutes);
app.use("/", seviceRoutes);

// Static file serving
app.use(
  "/assets",
  express.static(path.join(__dirname, "..", "assets", "Rooms"))
);
app.use(
  "/id_picture",
  express.static(path.join(__dirname, "..", "assets", "id_pictures"))
);
app.use(
  "/profile_pictures",
  express.static(path.join(__dirname, "..", "assets", "ProfilePic"))
);
app.use(
  "/advertisements",
  express.static(path.join(__dirname, "..", "assets", "Advertisements"))
);
app.use("/Logo", express.static(path.join(__dirname, "..", "assets", "Logo")));


const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
