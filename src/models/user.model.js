// models/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    provider: {
      type: String,
      default: "google",
    },

    // optional extra fields for your app
    currency: {
      type: String,
      default: "USD",
    },
    locale: {
      type: String,
      default: "en-US",
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);
module.exports = { userModel };
