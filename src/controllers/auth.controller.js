// controllers/auth.controller.js
const { firebaseAdminAuth } = require("../config/firebaseAdmin");
const { userModel } = require("../models/user.model");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const COOKIE_NAME =process.env.SESSION_COOKIE_NAME || "ft_session";

// POST /api/auth/google { idToken }
async function loginWithGoogle(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Missing idToken" });
    }

    // 1) Verify Firebase ID token
    const decoded = await firebaseAdminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email;
    const name = decoded.name || decoded.displayName || "User";
    const picture = decoded.picture || null;
    const phoneNumber = decoded.phone_number || null;

    // 2) Upsert user in your DB
    const user = await userModel.findOneAndUpdate(
      { firebaseUid: uid },
      {
        firebaseUid: uid,
        email,
        name,
        avatarUrl: picture,
        phoneNumber,
        provider: "google",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // 3) Create 1‑day session cookie
    const sessionCookie = await firebaseAdminAuth.createSessionCookie(idToken, {
      expiresIn: ONE_DAY_MS,
    });

    res.cookie(COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // false on localhost
      sameSite: "lax",
      maxAge: ONE_DAY_MS,
      path: "/",
    });

    return res.json({
      message: "Logged in",
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid credentials" });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  try {
    const sessionCookie = req.cookies[COOKIE_NAME];
    if (sessionCookie) {
      const decoded = await firebaseAdminAuth.verifySessionCookie(
        sessionCookie,
        true
      );
      await firebaseAdminAuth.revokeRefreshTokens(decoded.sub);
    }
  } catch (e) {
    console.error(e);
  }

  res.clearCookie(COOKIE_NAME, { path: "/" });
  return res.json({ message: "Logged out" });
}

// GET /api/auth/me
async function getCurrentUser(req, res) {
  if (!req.user) {
    return res.json({ user: null });
  }
  return res.json({ user: req.user });
}

module.exports = {
  loginWithGoogle,
  logout,
  getCurrentUser,
};
