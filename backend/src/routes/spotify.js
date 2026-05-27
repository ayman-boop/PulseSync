const express = require("express");
const {
  getSpotifyAuthUrl,
  exchangeCodeForTokens,
  setUserRefreshToken
} = require("../services/spotify");

const router = express.Router();

function encodeState(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeState(state) {
  if (!state) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
  } catch (_error) {
    return null;
  }
}

router.get("/login", (req, res) => {
  const userId = req.user?.id || req.query.userId || "anonymous";
  const frontendRedirect =
    typeof req.query.frontend_redirect === "string" ? req.query.frontend_redirect : null;
  const state = encodeState({ userId, frontendRedirect });
  const url = getSpotifyAuthUrl(state);

  if (!url) {
    return res.status(500).json({
      ok: false,
      error: "Spotify OAuth is not configured."
    });
  }

  return res.redirect(url);
});

router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json({
        ok: false,
        error: "Missing Spotify authorization code."
      });
    }

    const tokenData = await exchangeCodeForTokens(String(code));
    const parsedState = decodeState(state);
    const userId = parsedState?.userId || "anonymous";
    const frontendRedirectFromState = parsedState?.frontendRedirect || null;

    if (tokenData.refresh_token) {
      setUserRefreshToken(userId, tokenData.refresh_token);
    }

    const frontendBaseUrl =
      frontendRedirectFromState || process.env.FRONTEND_APP_URL || "http://localhost:19006";
    const redirectUrl = new URL(frontendBaseUrl);
    redirectUrl.searchParams.set("spotify", "connected");
    redirectUrl.searchParams.set("userId", String(userId));

    if (tokenData.access_token) {
      redirectUrl.searchParams.set("spotify_access_token", tokenData.access_token);
    }
    if (tokenData.refresh_token) {
      redirectUrl.searchParams.set("spotify_refresh_token", tokenData.refresh_token);
    }

    return res
      .status(200)
      .type("html")
      .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=${redirectUrl.toString()}" />
    <title>Spotify Connected</title>
  </head>
  <body>
    <p>Spotify connected. Redirecting back to app...</p>
    <script>window.location.replace(${JSON.stringify(redirectUrl.toString())});</script>
  </body>
</html>`);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Spotify OAuth callback failed.",
      details: error.message
    });
  }
});

module.exports = router;
