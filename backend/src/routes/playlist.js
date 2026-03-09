const express = require("express");
const { generateBlueprint } = require("../services/openai");
const {
  refreshAccessToken,
  getRecommendations,
  createPlaylist,
  addTracks
} = require("../services/spotify");

const router = express.Router();

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function buildRecommendationsParams(section) {
  const genres = Array.isArray(section?.genres) ? section.genres.slice(0, 5) : [];
  const bpm = Array.isArray(section?.bpm) ? section.bpm : [];
  const tempoFromBpm = bpm.length === 2 ? Math.round((Number(bpm[0]) + Number(bpm[1])) / 2) : undefined;
  const targetTempo = Number(section?.target_tempo) || tempoFromBpm;

  const params = {
    limit: "100"
  };

  if (genres.length > 0) {
    params.seed_genres = genres.join(",");
  }
  if (Number.isFinite(Number(section?.energy))) {
    params.target_energy = String(Number(section.energy));
  }
  if (Number.isFinite(targetTempo)) {
    params.target_tempo = String(targetTempo);
  }
  if (bpm.length === 2 && Number.isFinite(Number(bpm[0])) && Number.isFinite(Number(bpm[1]))) {
    params.min_tempo = String(Number(bpm[0]));
    params.max_tempo = String(Number(bpm[1]));
  }

  return params;
}

function getFriendlyErrorMessage(error, context) {
  const message = error?.message || "Unknown error";

  if (message.includes("Spotify refresh failed: 401") || message.includes("Spotify API error: 401")) {
    return "Spotify authentication failed (401). Please reconnect Spotify and try again.";
  }
  if (context === "openai") {
    return `OpenAI blueprint generation failed: ${message}`;
  }
  if (context === "spotify-refresh") {
    return `Failed to refresh Spotify access token: ${message}`;
  }
  if (context === "spotify-recommendations") {
    return `Failed to fetch Spotify recommendations: ${message}`;
  }
  if (context === "spotify-playlist") {
    return `Failed to create or populate Spotify playlist: ${message}`;
  }

  return message;
}

router.post("/api/playlist/generate", async (req, res) => {
  const { workout, spotifyRefreshToken } = req.body || {};

  if (!spotifyRefreshToken || typeof spotifyRefreshToken !== "string") {
    return res.status(400).json({
      ok: false,
      error: "Missing required field: spotifyRefreshToken."
    });
  }

  if (!workout || typeof workout !== "object") {
    return res.status(400).json({
      ok: false,
      error: "Missing or invalid workout object."
    });
  }

  let blueprint;
  try {
    blueprint = await generateBlueprint(workout);
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: getFriendlyErrorMessage(error, "openai")
    });
  }

  let accessToken;
  try {
    const tokenResponse = await refreshAccessToken(spotifyRefreshToken);
    accessToken = tokenResponse?.access_token;
  } catch (error) {
    const status = String(error?.message || "").includes("401") ? 401 : 502;
    return res.status(status).json({
      ok: false,
      error: getFriendlyErrorMessage(error, "spotify-refresh")
    });
  }

  if (!accessToken) {
    return res.status(502).json({
      ok: false,
      error: "Spotify did not return an access token during refresh."
    });
  }

  const seenTrackIds = new Set();
  const playlistUris = [];

  try {
    const sections = Array.isArray(blueprint?.sections) ? blueprint.sections : [];
    for (const section of sections) {
      const targetDurationMs = Math.max(1, Number(section?.minutes || 0)) * 60 * 1000;
      let sectionDurationMs = 0;
      let attempts = 0;

      while (sectionDurationMs < targetDurationMs * 0.95 && attempts < 4) {
        const recommendations = await getRecommendations(accessToken, buildRecommendationsParams(section));
        const tracks = Array.isArray(recommendations?.tracks) ? recommendations.tracks : [];

        if (tracks.length === 0) {
          break;
        }

        let addedInAttempt = 0;
        for (const track of tracks) {
          const trackId = track?.id;
          const trackUri = track?.uri;
          const durationMs = Number(track?.duration_ms || 0);
          const isExplicit = Boolean(track?.explicit);

          if (!trackId || !trackUri || durationMs <= 0) {
            continue;
          }
          if (!blueprint.explicit_allowed && isExplicit) {
            continue;
          }
          if (seenTrackIds.has(trackId)) {
            continue;
          }

          const projectedMs = sectionDurationMs + durationMs;
          if (projectedMs > targetDurationMs * 1.12 && sectionDurationMs >= targetDurationMs * 0.8) {
            continue;
          }

          seenTrackIds.add(trackId);
          playlistUris.push(trackUri);
          sectionDurationMs = projectedMs;
          addedInAttempt += 1;

          if (sectionDurationMs >= targetDurationMs * 0.98) {
            break;
          }
        }

        if (addedInAttempt === 0) {
          break;
        }
        attempts += 1;
      }
    }
  } catch (error) {
    const status = String(error?.message || "").includes("401") ? 401 : 502;
    return res.status(status).json({
      ok: false,
      error: getFriendlyErrorMessage(error, "spotify-recommendations")
    });
  }

  if (playlistUris.length === 0) {
    return res.status(422).json({
      ok: false,
      error: "No tracks could be selected for this workout blueprint."
    });
  }

  try {
    const workoutName = String(workout?.name || "Workout");
    const playlist = await createPlaylist(
      accessToken,
      blueprint?.name || `${workoutName} Mix`,
      blueprint?.explanation || `Generated for ${workoutName}`,
      false
    );

    const playlistId = playlist?.id;
    if (!playlistId) {
      return res.status(502).json({
        ok: false,
        error: "Spotify did not return a playlist ID."
      });
    }

    const batches = chunkArray(playlistUris, 100);
    for (const batch of batches) {
      await addTracks(accessToken, playlistId, batch);
    }

    return res.json({
      playlistUrl: playlist?.external_urls?.spotify || null,
      playlistId,
      blueprint
    });
  } catch (error) {
    const status = String(error?.message || "").includes("401") ? 401 : 502;
    return res.status(status).json({
      ok: false,
      error: getFriendlyErrorMessage(error, "spotify-playlist")
    });
  }
});

module.exports = router;
