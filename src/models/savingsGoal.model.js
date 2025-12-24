const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    deadline: {
      type: Date,
    },

    category: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

savingsGoalSchema.index({ userId: 1, status: 1 });

const savingsGoalModel = mongoose.model("SavingsGoal", savingsGoalSchema);
module.exports = { savingsGoalModel };
