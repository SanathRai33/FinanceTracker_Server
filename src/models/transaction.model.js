const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    description: {
      type: String,
      trim: true,
    },

    amount: {
      type: Number, // use Decimal128 if you want extra precision
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank", "wallet", "other"],
      default: "other",
    },

    recurring: {
      type: Boolean,
      default: false,
    },

    recurringInterval: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", null],
      default: null,
    },

    needOrWant: {
      type: String,
      enum: ["need", "want", "n/a"],
      default: "n/a",
    },

    notes: {
      type: String,
      trim: true,
    },

    // snapshot of balance after this transaction (optional, for fast dashboard)
    runningBalance: {
      type: Number,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, categoryId: 1 });
transactionSchema.index({ userId: 1, type: 1 });

const transactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = { transactionModel };
