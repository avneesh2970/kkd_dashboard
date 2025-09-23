import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { dbConnect } from "./helpers/database/dbConenct.js";
import "./cronJobs/accountCleanup.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
    maxAge: 600,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  return res
    .status(200)
    .json({ success: true, message: "api is up and running" });
});
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 5000;

dbConnect().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
