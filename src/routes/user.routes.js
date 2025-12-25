const express = require("express");
const router = express.Router();

const { registerUser, loginUser, logoutUser, getCurrentUser, updateUserProfile, deleteUserAccount, } = require("../controllers/user.controller");
const { authGuard } = require("../middlewares/auth.middleware");

// public
router.post("/register", registerUser);
router.post("/login", loginUser);

// authenticated
router.post("/logout", authGuard, logoutUser);
router.get("/me", authGuard, getCurrentUser);
router.put("/me", authGuard, updateUserProfile);
router.delete("/me", authGuard, deleteUserAccount);

module.exports = router;
