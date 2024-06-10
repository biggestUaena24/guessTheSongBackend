import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getPlaylists } from "../utils/spotifyUtil";

dotenv.config();
const router = express.Router();

router.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
  })
);

router.use(cookieParser());

router.get("/playlists", async (req, res) => {
  const userId = req.cookies.spotifyUserId;
  const token = req.cookies.spotifyToken;

  const result = await getPlaylists(userId, token);

  res.json({ playlists: result });
});

export default router;
