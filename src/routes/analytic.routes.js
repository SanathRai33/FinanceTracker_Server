// routes/analytic.routes.js
const express = require("express");
const router = express.Router();
const { firebaseSessionMiddleware } = require("../middlewares/auth.middleware");
const {
  getBalanceOverTime,
  getExpenseSavingsBreakdown,
  getNeedWantBreakdown,
  getAnalyticsStats,
} = require("../controllers/analytic.controller");

// ✅ ALL routes require authentication
router.use(firebaseSessionMiddleware);

router.get("/balance-over-time", getBalanceOverTime);
router.get("/expense-savings", getExpenseSavingsBreakdown);
router.get("/need-want", getNeedWantBreakdown);
router.get("/stats", getAnalyticsStats);

module.exports = router;
