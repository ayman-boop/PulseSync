const { createClient } = require("@supabase/supabase-js");

let cachedClient = null;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || "";
  const configured = Boolean(url && anonKey);

  return { url, anonKey, configured };
}

function getSupabaseClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const { url, anonKey, configured } = getSupabaseConfig();
  if (!configured) {
    return null;
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return cachedClient;
}

async function verifySupabaseJwt(accessToken) {
  const client = getSupabaseClient();
  if (!client) {
    return {
      user: null,
      error: null,
      skipped: true
    };
  }

  const { data, error } = await client.auth.getUser(accessToken);
  return {
    user: data?.user || null,
    error: error || null,
    skipped: false
  };
}

module.exports = {
  getSupabaseClient,
  getSupabaseConfig,
  verifySupabaseJwt
};
