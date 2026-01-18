import express from "express";
import { getAuthUrl, saveToken } from "../auth/oauth.js";

const router = express.Router();

router.get("/login", (req, res) => {
  res.redirect(getAuthUrl());
});

router.get("/callback", async (req, res) => {
  await saveToken(req.query.code);
  res.send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="5;url=/" />
      </head>
      <body style="font-family:sans-serif;text-align:center;padding-top:40px;">
        <h2>OAuth SUCCESS ✅ Token saved.</h2>
        <p>Redirecting to <a href="/">Home</a> in 5 seconds...</p>
      </body>
    </html>
  `);
});

export default router;
