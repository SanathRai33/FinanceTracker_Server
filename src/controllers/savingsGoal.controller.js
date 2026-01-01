// controllers/savingsGoal.controller.js - COMPLETE FIXED VERSION
const { savingsGoalModel } = require("../models/savingsGoal.model");

async function addSavingsGoal(req, res) {
  try {
    const goal = await savingsGoalModel.create({
      ...req.body,
      userId: req.user.id,
      currentAmount: req.body.currentAmount || 0, // ✅ Default to 0
      status: req.body.status || "active" // ✅ Default status
    });
    return res.status(201).json({ goal });
  } catch (error) {
    console.error("Add goal error:", error); // ✅ Log actual error
    return res.status(500).json({ message: "Failed to add goal", error: error.message });
  }
}

async function getAllSavingsGoals(req, res) {
  try {
    const goals = await savingsGoalModel.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ goals });
  } catch (error) {
    console.error("Get goals error:", error);
    return res.status(500).json({ message: "Failed to fetch goals" });
  }
}

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
  } catch (error) {
    console.error("Get goal error:", error);
    return res.status(500).json({ message: "Failed to fetch goal" });
  }
}

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
  } catch (error) {
    console.error("Update goal error:", error);
    return res.status(500).json({ message: "Failed to update goal" });
  }
}

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
  } catch (error) {
    console.error("Delete goal error:", error);
    return res.status(500).json({ message: "Failed to delete goal" });
  }
}

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
  } catch (error) {
    console.error("Update progress error:", error);
    return res.status(500).json({ message: "Failed to update progress" });
  }
}

async function getCompletedSavingsGoals(req, res) {
  try {
    const goals = await savingsGoalModel.find({
      userId: req.user.id,
      status: "completed",
    });
    return res.json({ goals });
  } catch (error) {
    console.error("Get completed goals error:", error);
    return res.status(500).json({ message: "Failed to fetch completed goals" });
  }
}

async function getActiveSavingsGoals(req, res) {
  try {
    const goals = await savingsGoalModel.find({
      userId: req.user.id,
      status: "active",
    });
    return res.json({ goals });
  } catch (error) {
    console.error("Get active goals error:", error);
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
