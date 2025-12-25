const { firebaseAdminAuth } = require("../config/firebaseAdmin");

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME;

async function firebaseSessionMiddleware(req, res, next) {
  const sessionCookie = req.cookies[COOKIE_NAME] || "";

  if (!sessionCookie) {
    req.user = null;
    return next();
  }

  try {
    const decoded = await firebaseAdminAuth.verifySessionCookie(
      sessionCookie,
      true
    );
    req.user = {
      id: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (err) {
    console.error("Invalid session cookie", err);
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
