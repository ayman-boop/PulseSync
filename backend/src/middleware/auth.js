const { verifySupabaseJwt } = require("../services/supabase");

function parseBearerToken(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

async function attachSupabaseUser(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next();
    }

    const token = parseBearerToken(authorizationHeader);
    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "Invalid Authorization header format. Use Bearer <token>."
      });
    }

    const { user, error, skipped } = await verifySupabaseJwt(token);

    if (skipped) {
      // TODO: Enforce full JWT verification once SUPABASE_URL/SUPABASE_ANON_KEY are set in every environment.
      req.authVerificationSkipped = true;
      return next();
    }

    if (error || !user) {
      return res.status(401).json({
        ok: false,
        error: "Invalid or expired token."
      });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(500).json({
      ok: false,
      error: "Failed to verify authentication token."
    });
  }
}

function requireAuthenticatedUser(req, res, next) {
  if (req.user) {
    return next();
  }

  if (req.authVerificationSkipped) {
    const token = parseBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "Authorization token is required."
      });
    }

    // TODO: Replace placeholder with verified Supabase user after env setup.
    req.user = { id: "placeholder-user" };
    return next();
  }

  return res.status(401).json({
    ok: false,
    error: "Authentication required."
  });
}

module.exports = {
  attachSupabaseUser,
  requireAuthenticatedUser
};
