const express = require("express");
const router = express.Router();

const {
  loginWithGoogle,
  logout,
  getCurrentUser,
} = require("../controllers/auth.controller");
const { firebaseSessionMiddleware } = require("../middlewares/auth.middleware");

// All routes here use session middleware so /me can read req.user
router.use(firebaseSessionMiddleware);

router.post("/google", loginWithGoogle);
router.post("/logout", logout);
router.get("/me", getCurrentUser);

module.exports = router;
