import express, { Request, Response, NextFunction } from "express";
import { generateRandomString } from "../utils/utils";
import dotenv from "dotenv";
import request from "request";
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

router.get("/login", (req, res) => {
  const scope = "streaming user-read-email user-read-private";
  const state = generateRandomString(16);

  const auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID || "",
    scope: scope,
    redirect_uri: "https://localhost:1314/auth/callback",
    state: state,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize/?" +
      auth_query_parameters.toString()
  );
});

router.get("/callback", (req, res) => {
  const code = req.query.code as string;
  const spotify_client_id = process.env.SPOTIFY_CLIENT_ID || "";
  const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET || "";

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: "https://localhost:1314/auth/callback",
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    json: true,
  };

  request.post(
    authOptions,
    (
      error: any,
      response: { statusCode: number },
      body: { access_token: any }
    ) => {
      if (!error && response.statusCode === 200) {
        res.cookie("spotifyToken", body.access_token, {
          httpOnly: true,
          secure: true,
          maxAge: 1000 * 60 * 60 * 24,
        });

        res.redirect("https://localhost:5173");
      } else {
        console.error(
          "Failed to get access token:",
          response.statusCode,
          error
        );
        res
          .status(response.statusCode)
          .json({ error: "Failed to get access token" });
      }
    }
  );
});

router.get("/token", (req, res) => {
  // After the user asks for a token, it means that the token shhould already be setted
  // So we are safe to return the token and we also want to set the cookie for spotify user id for the frontend
  res.json({ token: req.cookies.spotifyToken });
});

export default router;
