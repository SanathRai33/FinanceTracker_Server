// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const Joi = require('joi');

const {
  loginWithGoogle,
  logout,
  getCurrentUser,
} = require("../controllers/auth.controller");
const { firebaseSessionMiddleware } = require("../middlewares/auth.middleware");
const { validateBody } = require("../middlewares/validation.middleware");

// Validation schema
const loginSchema = Joi.object({
  idToken: Joi.string().required(),
});

// attach middleware so /me can read req.user
router.use(firebaseSessionMiddleware);

router.post("/google", validateBody(loginSchema), loginWithGoogle);
router.post("/logout", logout);
router.get("/me", getCurrentUser);

module.exports = router;
