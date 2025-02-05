import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
const router = express.Router();

router.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
  })
);

router.use(cookieParser());

router.post("/saved_tracks", async (req, res) => {
  const token = req.cookies.spotifyToken;

  const initialResponse = await fetch(
    "https://api.spotify.com/v1/me/tracks?offset=0&limit=50",
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const initialData = await initialResponse.json();
  let allItems = initialData.items;

  if (initialData.total > 50) {
    const totalTracks = initialData.total;
    const limit = 50;
    let offset = limit;

    while (offset < totalTracks) {
      const response = await fetch(
        `https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=${limit}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      allItems = allItems.concat(data.items);
      offset += limit;
    }
  }

  res.json({
    tracks: allItems.map((item: any) => item.track.uri),
  });
});

export default router;
