// routes/user.routes.js
const express = require("express");
const router = express.Router();
const { firebaseSessionMiddleware } = require("../middlewares/auth.middleware");
const userCtrl = require("../controllers/user.controller");

// All routes require authentication
router.use(firebaseSessionMiddleware);

// User profile routes
router.get("/me", userCtrl.getCurrentUser);
router.put("/me", userCtrl.updateUserProfile);
router.delete("/me", userCtrl.deleteUserAccount);

// User preferences routes
router.put("/me/notifications", userCtrl.updateNotificationPreferences);
router.put("/me/security", userCtrl.updateSecuritySettings);

// Create/sync user (usually called on first login)
router.post("/sync", userCtrl.createOrSyncUser);

module.exports = router;