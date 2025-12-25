const express = require("express");
const router = express.Router();

const { firebaseSessionMiddleware } = require("../middlewares/auth.middleware");
const txCtrl = require("../controllers/transaction.controller");

// all transaction routes require login
router.use(firebaseSessionMiddleware);

router.post("/", txCtrl.addTransaction);
router.get("/", txCtrl.getAllTransactions);

router.get("/by-month", txCtrl.getTransactionsByMonth);
router.get("/by-category/:categoryId", txCtrl.getTransactionsByCategory);
router.get("/by-type/:type", txCtrl.getTransactionsByType);
router.get("/recurring", txCtrl.getRecurringTransactions);

router.get("/summary/monthly", txCtrl.getMonthlySummary);
router.get("/summary/yearly", txCtrl.getYearlySummary);
router.get("/dashboard-stats", txCtrl.getDashboardStats);
router.get("/analytics", txCtrl.getAnalyticsData);

router
  .route("/:id")
  .get(txCtrl.getTransactionById)
  .put(txCtrl.updateTransaction)
  .delete(txCtrl.deleteTransaction);

module.exports = router;
