// controllers/analytic.controller.js
const { transactionModel } = require("../models/transaction.model");

async function getBalanceOverTime(req, res) {
  try {
    const { year } = req.query;
    const balanceData = await transactionModel.aggregate([
      { 
        $match: { 
          userId: req.user.id, 
          date: { 
            $gte: new Date(`${year}-01-01`), 
            $lte: new Date(`${year}-12-31`) 
          } 
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$date" }, 
            month: { $month: "$date" } 
          },
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          month: { $concat: ["M", { $toString: "$_id.month" }] },
          balance: { $subtract: ["$income", "$expense"] }
        }
      }
    ]);
    return res.json({ success: true, data: { balanceOverTime: balanceData } });
  } catch (error) {
    console.error("Balance over time error:", error);
    return res.status(500).json({ success: false, error: "Failed to compute balance over time" });
  }
}

async function getExpenseSavingsBreakdown(req, res) {
  try {
    const [totalIncome] = await transactionModel.aggregate([
      { $match: { userId: req.user.id, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const [totalExpense] = await transactionModel.aggregate([
      { $match: { userId: req.user.id, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const savings = (totalIncome?.total || 0) - (totalExpense?.total || 0);
    
    return res.json({ 
      totalIncome: totalIncome?.total || 0,
      totalExpense: totalExpense?.total || 0,
      savings 
    });
  } catch (error) {
    console.error("Expense breakdown error:", error);
    return res.status(500).json({ message: "Failed to compute expense breakdown" });
  }
}

async function getNeedWantBreakdown(req, res) {
  try {
    const breakdown = await transactionModel.aggregate([
      { $match: { userId: req.user.id, type: "expense", needOrWant: { $ne: "n/a" } } },
      {
        $group: {
          _id: "$needOrWant",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } }
    ]);
    return res.json({ needWantBreakdown: breakdown });
  } catch (error) {
    console.error("Need/Want breakdown error:", error);
    return res.status(500).json({ message: "Failed to compute need/want breakdown" });
  }
}

async function getAnalyticsStats(req, res) {
  try {
    const stats = await transactionModel.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
          avg: { $avg: "$amount" }
        }
      }
    ]);
    return res.json({ analyticsStats: stats });
  } catch (error) {
    console.error("Analytics stats error:", error);
    return res.status(500).json({ message: "Failed to compute analytics stats" });
  }
}

module.exports = {
  getBalanceOverTime,
  getExpenseSavingsBreakdown,
  getNeedWantBreakdown,
  getAnalyticsStats,
};
