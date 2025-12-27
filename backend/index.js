import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { dbConnect } from "./helpers/database/dbConenct.js";
import "./cronJobs/accountCleanup.js";
import { sendSmsOtp } from "./helpers/utils/sendSms/sms.js";

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

app.get("/test-sms", async (req, res) => {
  try {
    const result = await sendSmsOtp("7060390453", "123456");
    res.json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});


app.use("/api/admin", adminRoutes);
app.use("/api/user", userRouter);
app.get('/test', (req, res) => {
  res.send('Test route is working!');
});

const PORT = process.env.PORT || 5000;

dbConnect().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
