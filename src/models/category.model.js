const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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

    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
    },

    icon: {
      type: String, 
    },

    color: {
      type: String, 
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

const categoryModel = mongoose.model("Category", categorySchema);
module.exports = { categoryModel };
