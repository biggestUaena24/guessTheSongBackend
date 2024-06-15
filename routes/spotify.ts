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
  if (result.total > 50) {
    const playlistUrls = [];
    for (let i = 50; i < result.playlists.total; i += 50) {
      playlistUrls.push(
        `https://api.spotify.com/v1/users/${userId}/playlists?offset=${i}&limit=50`
      );
    }

    const playlistResults = await Promise.all(
      playlistUrls.map((url) =>
        fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json())
      )
    );

    playlistResults.forEach((result) => {
      result.playlists.items.forEach((item: any) => {
        result.playlists.items.push(item);
      });
    });
  }

  res.json({ playlists: result });
});

router.post("/tracks", async (req, res) => {
  const token = req.cookies.spotifyToken;
  const trackUrl = req.body.trackUrl;
  const totalTrack = req.body.totalTrack;

  if (totalTrack <= 100) {
    const result = await fetch(trackUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await result.json();

    res.json({ tracks: data });
  } else {
    const trackUrls = [];
    for (let i = 0; i < totalTrack; i += 100) {
      trackUrls.push(`${trackUrl}?offset=${i}&limit=100`);
    }

    const trackResults = await Promise.all(
      trackUrls.map((url) =>
        fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json())
      )
    );

    const tracks = trackResults.reduce((acc, result) => {
      acc.items = acc.items.concat(result.items);
      return acc;
    });

    res.json({ tracks });
  }
});

export default router;
