const mongoose = require("mongoose");

const debtRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },

    contactName: {
      type: String,
      required: true,
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    direction: {
      type: String,
      enum: ["lent", "borrowed"],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
      index: true,
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

debtRecordSchema.index({ userId: 1, status: 1, dueDate: 1 });

const debtRecordModel = mongoose.model("DebtRecord", debtRecordSchema);
module.exports = { debtRecordModel };
