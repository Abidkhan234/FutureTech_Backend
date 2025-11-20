import express from "express";
import cors from "cors";
import mainRoute from "./Routes/mainRoute.js";
import mongoose from "./DB/index.js";
import "dotenv/config";
import rateLimiter from "./Config/rateLimiter.js";

const app = express();

const port = process.env.PORT || 5000;

// Trust reverse proxy (important for production like Leapcell)
app.set("trust proxy", 1);

const db = mongoose.connection;

db.on("Error", (error) => {
  console.log("DB Error", error);
});

db.once("open", () => {
  console.log("DB Connected");
});

app.use(
  cors({
    // origin: process.env.FRONTEND_URL,
    // credentials: true
  })
);

app.use(rateLimiter);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api", mainRoute);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
