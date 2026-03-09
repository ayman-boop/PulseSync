const express = require("express");
const { getSupabaseClient } = require("../services/supabase");

const router = express.Router();

router.get("/status", (_req, res) => {
  const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  res.json({ ok: true, supabaseConfigured: configured });
});

router.get("/helper", (_req, res) => {
  const client = getSupabaseClient();
  res.json({ ok: true, hasSupabaseClient: Boolean(client) });
});

module.exports = router;
