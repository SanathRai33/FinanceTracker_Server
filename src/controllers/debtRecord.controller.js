const { debtRecordModel } = require("../models/debtRecord.model");

// POST /api/debts
async function getAllDebtRecords(req, res) {
  try {
    console.log(
      "Debt records request - user:",
      req.user ? req.user.id : "NO USER"
    ); // ✅ DEBUG

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const records = await debtRecordModel.find({ userId: req.user.id });

    if (records.length === 0) {
      return res.json({ records: [], message: "No records found" });
    }

    return res.json({ records });
  } catch (error) {
    console.error("Get all debt records error:", error); // ✅ LOG ERROR
    return res
      .status(500)
      .json({ message: "Failed to fetch debt records", error: error.message });
  }
}

async function addDebtRecord(req, res) {
  try {
    console.log("Add debt request - user:", req.user ? req.user.id : "NO USER"); // ✅ DEBUG

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const record = await debtRecordModel.create({
      ...req.body,
      userId: req.user.id,
    });
    return res.status(201).json({ record });
  } catch (error) {
    console.error("Add debt record error:", error);
    return res
      .status(500)
      .json({ message: "Failed to add debt record", error: error.message });
  }
}

// GET /api/debts/:id
async function getDebtRecordById(req, res) {
  try {
    const record = await debtRecordModel.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!record) {
      return res.status(404).json({ message: "Debt record not found" });
    }
    return res.json({ record });
  } catch {
    return res.status(500).json({ message: "Failed to fetch debt record" });
  }
}

// PUT /api/debts/:id
async function updateDebtRecord(req, res) {
  try {
    const record = await debtRecordModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ message: "Debt record not found" });
    }
    return res.json({ message: "Debt record updated", record });
  } catch {
    return res.status(500).json({ message: "Failed to update debt record" });
  }
}

// DELETE /api/debts/:id
async function deleteDebtRecord(req, res) {
  try {
    const deleted = await debtRecordModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Debt record not found" });
    }
    return res.json({ message: "Debt record deleted" });
  } catch {
    return res.status(500).json({ message: "Failed to delete debt record" });
  }
}

// GET /api/debts/pending
async function getPendingDebts(req, res) {
  try {
    const records = await debtRecordModel.find({
      userId: req.user.id,
      status: "pending",
    });
    return res.json({ records });
  } catch {
    return res.status(500).json({ message: "Failed to fetch pending debts" });
  }
}

// GET /api/debts/paid
async function getPaidDebts(req, res) {
  try {
    const records = await debtRecordModel.find({
      userId: req.user.id,
      status: "paid",
    });
    return res.json({ records });
  } catch {
    return res.status(500).json({ message: "Failed to fetch paid debts" });
  }
}

module.exports = {
  addDebtRecord,
  getAllDebtRecords,
  getDebtRecordById,
  updateDebtRecord,
  deleteDebtRecord,
  getPendingDebts,
  getPaidDebts,
};
