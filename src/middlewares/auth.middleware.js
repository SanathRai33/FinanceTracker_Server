// middlewares/auth.middleware.js
const { firebaseAdminAuth } = require("../config/firebaseAdmin");

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "ft_session";

async function firebaseSessionMiddleware(req, _res, next) {
  let sessionCookie = req.cookies[COOKIE_NAME] || "";
  let token = null;

  // Check for Bearer token in Authorization header
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // Try session cookie first, then Bearer token
  if (!sessionCookie && !token) {
    req.user = null;
    return next();
  }

  try {
    let decoded;
    
    if (sessionCookie) {
      // Verify session cookie
      decoded = await firebaseAdminAuth.verifySessionCookie(
        sessionCookie,
        true
      );
    } else if (token) {
      // Verify Bearer token (ID token)
      decoded = await firebaseAdminAuth.verifyIdToken(token);
    }

    if (decoded) {
      req.user = {
        id: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        avatarUrl: decoded.picture
      };
    }
  } catch (err) {
    console.error("Invalid session cookie or token", err);
    req.user = null;
  }

  return next();
}

// For protected routes
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

module.exports = { firebaseSessionMiddleware, requireAuth };
