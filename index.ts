import express, { Express } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 1314;

app.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
