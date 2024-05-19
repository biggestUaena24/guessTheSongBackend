import express, { Express, Request, Response } from "express";
import { generateRandomString } from "../utils/utils";
import dotenv from "dotenv";
import request from "request";
import session from "express-session";

const router = express.Router();
dotenv.config();

router.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

router.get("/login", (req, res) => {
  const scope = "streaming user-read-email user-read-private";
  const state = generateRandomString(16);

  const auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: process.env.CLIENT_ID || "",
    scope: scope,
    redirect_uri: "http://localhost:1314/auth/callback",
    state: state,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize/?" +
      auth_query_parameters.toString()
  );
});

router.get("/callback", (req, res) => {
  const code = req.query.code as string;
  const spotify_client_id = process.env.CLIENT_ID || "";
  const spotify_client_secret = process.env.CLIENT_SECRET || "";

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: "http://localhost:1314/auth/callback",
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
        (req.session as any).accessToken = body.access_token;
        res.redirect("/");
      } else {
        res
          .status(response.statusCode)
          .json({ error: "Failed to get access token" });
      }
    }
  );
});

router.get("/token", (req, res) => {
  if ((req.session as any).accessToken) {
    res.json({ token: (req.session as any).accessToken });
  } else {
    res.status(401).json({ error: "Access token not available" });
  }
});

export default router;
