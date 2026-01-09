// controllers/user.controller.js
const { userModel } = require("../models/user.model");
const mongoose = require("mongoose");

// Get current user profile
async function getCurrentUser(req, res) {
  try {

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const user = await userModel.findOne({
      firebaseUid: req.user.id,
      deleted: false,
      accountStatus: "active",
    }).select("-__v -deleted -deletedAt -security -verification -metadata");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Failed to fetch user profile"
    });
  }
}

// Update user profile
async function updateUserProfile(req, res) {
  try {

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Allowed fields for update
    const allowedUpdates = [
      'name', 'firstName', 'lastName', 'phoneNumber', 
      'dateOfBirth', 'gender', 'currency', 'locale',
      'address', 'timezone', 'numberFormat'
    ];
    
    // Filter updates
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // If name is provided, split into first/last name
    if (updates.name) {
      const nameParts = updates.name.split(' ');
      updates.firstName = nameParts[0] || '';
      updates.lastName = nameParts.slice(1).join(' ') || '';
    }

    const user = await userModel.findOneAndUpdate(
      { firebaseUid: req.user.id, deleted: false },
      updates,
      { 
        new: true,
        runValidators: true 
      }
    ).select("-__v -deleted -deletedAt -security -verification -metadata -firebaseUid");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ 
      message: "Profile updated successfully", 
      user 
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    
    return res.status(500).json({ 
      message: "Failed to update profile", 
      error: error.message 
    });
  }
}

// Update notification preferences
async function updateNotificationPreferences(req, res) {
  try {

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { notifications } = req.body;
    if (!notifications) {
      return res.status(400).json({ message: "Notifications data is required" });
    }

    const user = await userModel.findOneAndUpdate(
      { firebaseUid: req.user.id, deleted: false },
      { notifications },
      { 
        new: true,
        runValidators: true 
      }
    ).select("-__v -deleted -deletedAt -security -verification -metadata -firebaseUid");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ 
      message: "Notification preferences updated", 
      user 
    });
  } catch (error) {
    console.error("Update notifications error:", error);
    return res.status(500).json({ 
      message: "Failed to update notifications", 
      error: error.message 
    });
  }
}

// Update security settings
async function updateSecuritySettings(req, res) {
  try {

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { security } = req.body;
    if (!security) {
      return res.status(400).json({ message: "Security data is required" });
    }

    const user = await userModel.findOneAndUpdate(
      { firebaseUid: req.user.id, deleted: false },
      { security },
      { 
        new: true,
        runValidators: true 
      }
    ).select("-__v -deleted -deletedAt -security.loginDevices -verification -metadata -firebaseUid");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ 
      message: "Security settings updated", 
      user 
    });
  } catch (error) {
    console.error("Update security error:", error);
    return res.status(500).json({ 
      message: "Failed to update security settings", 
      error: error.message 
    });
  }
}

// Delete user account (soft delete)
async function deleteUserAccount(req, res) {
  try {

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await userModel.findOneAndUpdate(
      { firebaseUid: req.user.id, deleted: false },
      { 
        deleted: true,
        deletedAt: new Date(),
        accountStatus: "deactivated"
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ 
      message: "Account deleted successfully" 
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ 
      message: "Failed to delete account", 
      error: error.message 
    });
  }
}

// Create or sync user (for first login)
async function createOrSyncUser(req, res) {
  try {

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { email, name, avatarUrl, phoneNumber } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    let user = await userModel.findOne({ firebaseUid: req.user.id });

    if (user) {
      // Update existing user with latest info from Firebase
      user.email = email;
      user.name = name || user.name;
      user.avatarUrl = avatarUrl || user.avatarUrl;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.lastLogin = new Date();
      user.lastActive = new Date();
      user.loginCount += 1;

      await user.save();
    } else {
      // Create new user
      user = await userModel.create({
        firebaseUid: req.user.id,
        email,
        name: name || "",
        avatarUrl: avatarUrl || "",
        phoneNumber: phoneNumber || "",
        lastLogin: new Date(),
        lastActive: new Date(),
        loginCount: 1,
        metadata: {
          signupSource: req.body.signupSource || "web",
          browser: req.headers['user-agent'],
          os: req.body.os || "",
          device: req.body.device || ""
        }
      });
    }

    // Return safe user object
    const safeUser = user.toSafeObject ? user.toSafeObject() : {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      currency: user.currency,
      locale: user.locale,
      subscription: user.subscription,
      notifications: user.notifications,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(user.isNew ? 201 : 200).json({ 
      message: user.isNew ? "User created successfully" : "User synced successfully",
      user: safeUser
    });
  } catch (error) {
    console.error("Create/sync user error:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "User already exists with this email" 
      });
    }
    
    return res.status(500).json({ 
      message: "Failed to create/sync user", 
      error: error.message 
    });
  }
}

module.exports = {
  getCurrentUser,
  updateUserProfile,
  updateNotificationPreferences,
  updateSecuritySettings,
  deleteUserAccount,
  createOrSyncUser
};