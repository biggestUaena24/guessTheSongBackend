import express, { Express } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 1314;

app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
