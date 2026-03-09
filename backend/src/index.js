const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const spotifyRoutes = require("./routes/spotify");
const playlistRoutes = require("./routes/playlist");
const { attachSupabaseUser, requireAuthenticatedUser } = require("./middleware/auth");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const corsOrigin = process.env.FRONTEND_APP_URL || process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use(attachSupabaseUser);

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/auth/spotify", spotifyRoutes);
app.use("/", requireAuthenticatedUser, playlistRoutes);

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
