const { savingsGoalModel } = require("../models/savingsGoal.model");

// POST /api/goals
async function addSavingsGoal(req, res) {
  try {
    const goal = await savingsGoalModel.create({
      ...req.body,
      userId: req.user.id,
    });
    return res.status(201).json({ goal });
  } catch {
    return res.status(500).json({ message: "Failed to add goal" });
  }
}

// GET /api/goals
async function getAllSavingsGoals(req, res) {
  try {
    const goals = await savingsGoalModel.find({ userId: req.user.id });
    return res.json({ goals });
  } catch {
    return res.status(500).json({ message: "Failed to fetch goals" });
  }
}

// GET /api/goals/:id
async function getSavingsGoalById(req, res) {
  try {
    const goal = await savingsGoalModel.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    return res.json({ goal });
  } catch {
    return res.status(500).json({ message: "Failed to fetch goal" });
  }
}

// PUT /api/goals/:id
async function updateSavingsGoal(req, res) {
  try {
    const goal = await savingsGoalModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    return res.json({ message: "Goal updated", goal });
  } catch {
    return res.status(500).json({ message: "Failed to update goal" });
  }
}

// DELETE /api/goals/:id
async function deleteSavingsGoal(req, res) {
  try {
    const deleted = await savingsGoalModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Goal not found" });
    }
    return res.json({ message: "Goal deleted" });
  } catch {
    return res.status(500).json({ message: "Failed to delete goal" });
  }
}

// PATCH /api/goals/:id/progress
async function updateSavingsProgress(req, res) {
  try {
    const { amountToAdd } = req.body;

    const goal = await savingsGoalModel.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    goal.currentAmount += Number(amountToAdd || 0);
    if (goal.currentAmount >= goal.targetAmount && goal.status !== "completed") {
      goal.status = "completed";
    }

    await goal.save();
    return res.json({ message: "Progress updated", goal });
  } catch {
    return res.status(500).json({ message: "Failed to update progress" });
  }
}

// GET /api/goals/completed
async function getCompletedSavingsGoals(req, res) {
  try {
    const goals = await savingsGoalModel.find({
      userId: req.user.id,
      status: "completed",
    });
    return res.json({ goals });
  } catch {
    return res.status(500).json({ message: "Failed to fetch completed goals" });
  }
}

// GET /api/goals/active
async function getActiveSavingsGoals(req, res) {
  try {
    const goals = await savingsGoalModel.find({
      userId: req.user.id,
      status: "active",
    });
    return res.json({ goals });
  } catch {
    return res.status(500).json({ message: "Failed to fetch active goals" });
  }
}

module.exports = {
  addSavingsGoal,
  getAllSavingsGoals,
  getSavingsGoalById,
  updateSavingsGoal,
  deleteSavingsGoal,
  updateSavingsProgress,
  getCompletedSavingsGoals,
  getActiveSavingsGoals,
};
