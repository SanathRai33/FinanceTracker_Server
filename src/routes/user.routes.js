const express = require("express");
const router = express.Router();

const { registerUser, loginUser, logoutUser, getCurrentUser, updateUserProfile, deleteUserAccount, } = require("../controllers/user.controller");
const { firebaseSessionMiddleware } = require("../middlewares/auth.middleware");

// public
router.post("/register", registerUser);
router.post("/login", loginUser);

// authenticated
router.post("/logout", firebaseSessionMiddleware, logoutUser);
router.get("/me", firebaseSessionMiddleware, getCurrentUser);
router.put("/me", firebaseSessionMiddleware, updateUserProfile);
router.delete("/me", firebaseSessionMiddleware, deleteUserAccount);

module.exports = router;
