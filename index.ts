import express, { Express } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import spotifyRoutes from "./routes/spotify";
import cors from "cors";
import cookieParser from "cookie-parser";
import https from "https";
import fs from "fs";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 1314;

const privateKey = fs.readFileSync("server.key", "utf8");
const certificate = fs.readFileSync("server.cert", "utf8");
const credentials = { key: privateKey, cert: certificate };

app.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/spotify", spotifyRoutes);

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
