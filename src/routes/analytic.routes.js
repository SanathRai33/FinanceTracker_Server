// routes/analytic.routes.js
const express = require("express");
const router = express.Router();
const { firebaseSessionMiddleware } = require("../middlewares/auth.middleware");
const { cacheMiddleware } = require("../middlewares/cache.middleware");
const {
  getBalanceOverTime,
  getExpenseSavingsBreakdown,
  getNeedWantBreakdown,
  getAnalyticsStats,
} = require("../controllers/analytic.controller");

// ✅ ALL routes require authentication
router.use(firebaseSessionMiddleware);

router.get("/balance-over-time", cacheMiddleware(600), getBalanceOverTime); // 10 min cache
router.get("/expense-savings", cacheMiddleware(600), getExpenseSavingsBreakdown);
router.get("/need-want", cacheMiddleware(600), getNeedWantBreakdown);
router.get("/stats", cacheMiddleware(300), getAnalyticsStats); // 5 min cache

module.exports = router;
