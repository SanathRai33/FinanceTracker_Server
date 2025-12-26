// routes/auth.routes.js
const express = require("express");
const router = express.Router();

const {
  loginWithGoogle,
  logout,
  getCurrentUser,
} = require("../controllers/auth.controller");
const { firebaseSessionMiddleware } = require("../middlewares/auth.middleware");

// attach middleware so /me can read req.user
router.use(firebaseSessionMiddleware);

router.post("/google", loginWithGoogle);
router.post("/logout", logout);
router.get("/me", getCurrentUser);

module.exports = router;
