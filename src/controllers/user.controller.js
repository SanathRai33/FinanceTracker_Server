const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user.model");

// POST /api/auth/register
async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userModel.create({ name, email, passwordHash });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Registration failed" });
  }
}

// POST /api/auth/login
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
}

// POST /api/auth/logout  (JWT: client just drops token; optional blacklist)
async function logoutUser(_req, res) {
  return res.json({ message: "Logged out successfully" });
}

// GET /api/auth/me
async function getCurrentUser(req, res) {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
}

// PUT /api/auth/me
async function updateUserProfile(req, res) {
  try {
    const { name, avatarUrl, currency, locale } = req.body;

    const user = await userModel.findByIdAndUpdate(
      req.user.id,
      { name, avatarUrl, currency, locale },
      { new: true }
    ).select("-passwordHash");

    return res.json({ message: "Profile updated", user });
  } catch {
    return res.status(500).json({ message: "Failed to update profile" });
  }
}

// DELETE /api/auth/me
async function deleteUserAccount(req, res) {
  try {
    await userModel.findByIdAndDelete(req.user.id);
    return res.json({ message: "Account deleted" });
  } catch {
    return res.status(500).json({ message: "Failed to delete account" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  deleteUserAccount,
};
