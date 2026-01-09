const { transactionModel } = require("../models/transaction.model");

// POST /api/transactions
async function addTransaction(req, res) {
  try {
    const transaction = await transactionModel.create({
      ...req.body,
      userId: req.user.id,
    });
    return res.status(201).json({ success: true, data: { transaction } });
  } catch (error) {
    console.error("Error adding transaction:", error);
    // Return validation errors if it's a mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        success: false,
        error: "Validation error", 
        details: Object.values(error.errors).map((e) => e.message) 
      });
    }
    return res.status(500).json({ success: false, error: "Failed to add transaction" });
  }
}

// GET /api/transactions
async function getAllTransactions(req, res) {
  try {
    const transactions = await transactionModel
      .find({ userId: req.user.id })
      .sort({ date: -1 });
    return res.json({ success: true, data: { transactions } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to fetch transactions" });
  }
}

// GET /api/transactions/:id
async function getTransactionById(req, res) {
  try {
    const transaction = await transactionModel.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!transaction) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }
    return res.json({ success: true, data: { transaction } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to fetch transaction" });
  }
}

// PUT /api/transactions/:id
async function updateTransaction(req, res) {
  try {
    const transaction = await transactionModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }
    return res.json({ success: true, data: { message: "Transaction updated", transaction } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to update transaction" });
  }
}

// DELETE /api/transactions/:id
async function deleteTransaction(req, res) {
  try {
    const deleted = await transactionModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }
    return res.json({ success: true, data: { message: "Transaction deleted" } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to delete transaction" });
  }
}

// GET /api/transactions/by-month?year=2025&month=11
async function getTransactionsByMonth(req, res) {
  try {
    const { year, month } = req.query;
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    const transactions = await transactionModel.find({
      userId: req.user.id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    return res.json({ success: true, data: { transactions } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to fetch by month" });
  }
}

// GET /api/transactions/by-category/:categoryId
async function getTransactionsByCategory(req, res) {
  try {
    const transactions = await transactionModel.find({
      userId: req.user.id,
      categoryId: req.params.categoryId,
    }).sort({ date: -1 });

    return res.json({ success: true, data: { transactions } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to fetch by category" });
  }
}

// GET /api/transactions/by-type/:type   (income/expense/transfer)
async function getTransactionsByType(req, res) {
  try {
    const transactions = await transactionModel.find({
      userId: req.user.id,
      type: req.params.type,
    }).sort({ date: -1 });

    return res.json({ success: true, data: { transactions } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to fetch by type" });
  }
}

// GET /api/transactions/recurring
async function getRecurringTransactions(req, res) {
  try {
    const transactions = await transactionModel.find({
      userId: req.user.id,
      recurring: true,
    }).sort({ date: -1 });

    return res.json({ success: true, data: { transactions } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to fetch recurring" });
  }
}

// GET /api/transactions/summary/monthly?year=2025
async function getMonthlySummary(req, res) {
  try {
    const { year } = req.query;

    const summary = await transactionModel.aggregate([
      { $match: { userId: req.user.id, date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
      {
        $group: {
          _id: { month: { $month: "$date" }, type: "$type" },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    return res.json({ success: true, data: { summary } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to compute monthly summary" });
  }
}

// GET /api/transactions/summary/yearly
async function getYearlySummary(req, res) {
  try {
    const summary = await transactionModel.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: { year: { $year: "$date" }, type: "$type" },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    return res.json({ success: true, data: { summary } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to compute yearly summary" });
  }
}

// GET /api/transactions/dashboard-stats
async function getDashboardStats(req, res) {
  try {
    const [incomeAgg] = await transactionModel.aggregate([
      { $match: { userId: req.user.id, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const [expenseAgg] = await transactionModel.aggregate([
      { $match: { userId: req.user.id, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalIncome = incomeAgg?.total || 0;
    const totalExpenses = expenseAgg?.total || 0;
    const netBalance = totalIncome - totalExpenses;

    return res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netBalance,
      },
    });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to compute dashboard stats" });
  }
}

// GET /api/transactions/analytics
async function getAnalyticsData(req, res) {
  try {
    const byCategory = await transactionModel.aggregate([
      { $match: { userId: req.user.id, type: "expense" } },
      { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
    ]);

    const byNeedWant = await transactionModel.aggregate([
      { $match: { userId: req.user.id, type: "expense" } },
      { $group: { _id: "$needOrWant", total: { $sum: "$amount" } } },
    ]);

    return res.json({ success: true, data: { byCategory, byNeedWant } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to compute analytics" });
  }
}

module.exports = {
  addTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionsByMonth,
  getTransactionsByCategory,
  getTransactionsByType,
  getRecurringTransactions,
  getMonthlySummary,
  getYearlySummary,
  getDashboardStats,
  getAnalyticsData,
};
