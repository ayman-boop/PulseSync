const SPOTIFY_ACCOUNTS_BASE_URL = "https://accounts.spotify.com";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
const DEFAULT_SCOPES = "playlist-modify-private playlist-modify-public user-read-email";

const refreshTokenByUserId = new Map();

function getSpotifyConfig() {
  return {
    clientId: process.env.SPOTIFY_CLIENT_ID || "",
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
    redirectUri: process.env.SPOTIFY_REDIRECT_URI || "",
    scopes: process.env.SPOTIFY_SCOPES || DEFAULT_SCOPES
  };
}

function getSpotifyAuthUrl(state) {
  const { clientId, redirectUri, scopes } = getSpotifyConfig();
  if (!clientId || !redirectUri) {
    return null;
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri
  });

  if (state) {
    params.set("state", state);
  }

  return `${SPOTIFY_ACCOUNTS_BASE_URL}/authorize?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  const { clientId, clientSecret, redirectUri } = getSpotifyConfig();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri
  });

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Spotify token exchange failed: ${response.status} ${details}`);
  }

  return response.json();
}

async function refreshAccessToken(refreshToken) {
  const { clientId, clientSecret } = getSpotifyConfig();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Spotify refresh failed: ${response.status} ${details}`);
  }

  return response.json();
}

async function spotifyApiRequest(path, accessToken, options = {}) {
  const response = await fetch(`${SPOTIFY_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Spotify API error: ${response.status} ${details}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function getMe(accessToken) {
  return spotifyApiRequest("/me", accessToken);
}

async function createPlaylist(accessToken, name, description, isPublic = false) {
  const me = await getMe(accessToken);
  return spotifyApiRequest(`/users/${me.id}/playlists`, accessToken, {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      public: Boolean(isPublic)
    })
  });
}

async function addTracks(accessToken, playlistId, uris) {
  return spotifyApiRequest(`/playlists/${playlistId}/tracks`, accessToken, {
    method: "POST",
    body: JSON.stringify({ uris })
  });
}

async function getRecommendations(accessToken, params = {}) {
  const query = new URLSearchParams(params);
  return spotifyApiRequest(`/recommendations?${query.toString()}`, accessToken);
}

function setUserRefreshToken(userId, refreshToken) {
  if (!userId || !refreshToken) {
    return;
  }
  // TODO: Persist refresh tokens in the database instead of in-memory storage.
  refreshTokenByUserId.set(String(userId), refreshToken);
}

function getUserRefreshToken(userId) {
  return refreshTokenByUserId.get(String(userId)) || null;
}

function buildSpotifyPlaylistRequest(seed) {
  return {
    name: "PulseSync Playlist",
    description: `Generated from seed: ${seed}`,
    tracks: []
  };
}

module.exports = {
  getSpotifyAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getMe,
  createPlaylist,
  addTracks,
  getRecommendations,
  setUserRefreshToken,
  getUserRefreshToken,
  buildSpotifyPlaylistRequest
};
