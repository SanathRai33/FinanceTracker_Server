// models/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },

    // Personal Information
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say", ""],
      default: "",
    },

    // Contact Information
    address: {
      street: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: "India",
      },
      zipCode: String,
    },

    // Financial Preferences
    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD"],
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    locale: {
      type: String,
      default: "en-IN",
    },
    numberFormat: {
      type: String,
      default: "en-IN",
    },

    // Account Settings
    provider: {
      type: String,
      default: "google",
      enum: ["google", "email", "apple", "github"],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deactivated", "pending"],
      default: "active",
    },

    // Roles & Permissions
    role: {
      type: String,
      enum: ["user", "premium_user", "admin", "super_admin"],
      default: "user",
    },
    permissions: [
      {
        type: String,
        enum: [
          "view_dashboard",
          "add_transaction",
          "edit_transaction",
          "delete_transaction",
          "view_reports",
          "export_data",
          "manage_categories",
          "manage_tags",
          "view_analytics",
          "manage_budgets",
          "view_investments",
          "manage_savings",
          "manage_debts",
          "invite_users",
          "manage_subscription",
          "access_api",
        ],
      },
    ],

    // Subscription & Billing
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "pro", "business", ""],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "canceled", "past_due", "trialing", "incomplete", ""],
        default: "",
      },
      currentPeriodEnd: Date,
      cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
      },
      stripeCustomerId: String,
      stripeSubscriptionId: String,
    },

    // Notification Preferences
    notifications: {
      email: {
        transactionAlerts: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: true },
        monthlySummaries: { type: Boolean, default: true },
        budgetAlerts: { type: Boolean, default: true },
        securityAlerts: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
      push: {
        transactionAlerts: { type: Boolean, default: true },
        budgetAlerts: { type: Boolean, default: true },
        goalReminders: { type: Boolean, default: true },
      },
      sms: {
        securityAlerts: { type: Boolean, default: true },
        importantUpdates: { type: Boolean, default: false },
      },
    },

    // Security Settings
    security: {
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
      twoFactorMethod: {
        type: String,
        enum: ["authenticator", "sms", "email", ""],
        default: "",
      },
      lastPasswordChange: Date,
      failedLoginAttempts: {
        type: Number,
        default: 0,
      },
      accountLockedUntil: Date,
      loginDevices: [
        {
          deviceId: String,
          deviceName: String,
          lastAccessed: Date,
          ipAddress: String,
          userAgent: String,
        },
      ],
    },

    // Financial Settings
    financialSettings: {
      defaultAccountId: mongoose.Schema.Types.ObjectId,
      defaultCategoryId: mongoose.Schema.Types.ObjectId,
      taxRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      financialYearStart: {
        type: String,
        default: "April",
      },
      financialYearEnd: {
        type: String,
        default: "March",
      },
      roundingRules: {
        type: String,
        enum: ["normal", "up", "down", "nearest"],
        default: "normal",
      },
    },

    // Privacy Settings
    privacy: {
      profileVisibility: {
        type: String,
        enum: ["private", "contacts_only", "public"],
        default: "private",
      },
      transactionPrivacy: {
        type: String,
        enum: ["private", "anonymous_aggregate", "public"],
        default: "private",
      },
      dataSharing: {
        research: { type: Boolean, default: false },
        marketing: { type: Boolean, default: false },
        thirdParty: { type: Boolean, default: false },
      },
    },

    // Activity Tracking
    lastLogin: Date,
    lastActive: Date,
    loginCount: {
      type: Number,
      default: 0,
    },

    // Account Verification
    verification: {
      emailToken: String,
      emailTokenExpires: Date,
      phoneToken: String,
      phoneTokenExpires: Date,
      identityVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: Date,
    },

    // Metadata
    metadata: {
      signupSource: String, // web, ios, android
      referrer: String,
      utmSource: String,
      utmMedium: String,
      utmCampaign: String,
      browser: String,
      os: String,
      device: String,
    },

    // Soft Delete
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,

    // Versioning
    __v: { type: Number, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name || "";
});

// Virtual for account age
userSchema.virtual("accountAge").get(function () {
  if (!this.createdAt) return 0;
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Indexes
userSchema.index({ email: 1, deleted: 1 });
userSchema.index({ firebaseUid: 1, deleted: 1 });
userSchema.index({ "subscription.plan": 1, "subscription.status": 1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware
userSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.firstName && !this.lastName) {
    const nameParts = this.name.split(" ");
    this.firstName = nameParts[0] || "";
    this.lastName = nameParts.slice(1).join(" ") || "";
  }
  next();
});

// Method to check if user has permission
userSchema.methods.hasPermission = function (permission) {
  if (this.role === "super_admin") return true;
  if (this.role === "admin" && permission.startsWith("manage_")) return true;
  return this.permissions.includes(permission);
};

// Method to get safe user object (without sensitive data)
userSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.firebaseUid;
  delete user.security;
  delete user.verification;
  delete user.metadata;
  delete user.deleted;
  delete user.deletedAt;
  return user;
};

// Static method to find active users
userSchema.statics.findActive = function () {
  return this.find({
    deleted: false,
    accountStatus: "active",
  });
};

const userModel = mongoose.model("User", userSchema);

module.exports = { userModel };
