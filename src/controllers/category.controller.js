const { categoryModel } = require("../models/category.model");

// POST /api/categories
async function addCategory(req, res) {
  try {
    const category = await categoryModel.create({
      ...req.body,
      userId: req.user.id,
    });
    return res.status(201).json({ category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Category already exists" });
    }
    return res.status(500).json({ message: "Failed to add category" });
  }
}

// GET /api/categories
async function getAllCategories(req, res) {
  try {
    const categories = await categoryModel.find({ userId: req.user.id });
    return res.json({ categories });
  } catch {
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
}

// PUT /api/categories/:id
async function updateCategory(req, res) {
  try {
    const category = await categoryModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.json({ message: "Category updated", category });
  } catch {
    return res.status(500).json({ message: "Failed to update category" });
  }
}

// DELETE /api/categories/:id
async function deleteCategory(req, res) {
  try {
    const deleted = await categoryModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.json({ message: "Category deleted" });
  } catch {
    return res.status(500).json({ message: "Failed to delete category" });
  }
}

// GET /api/categories/type/:type   (income/expense/transfer)
async function getCategoriesByType(req, res) {
  try {
    const categories = await categoryModel.find({
      userId: req.user.id,
      type: req.params.type,
    });
    return res.json({ categories });
  } catch {
    return res.status(500).json({ message: "Failed to fetch categories by type" });
  }
}

module.exports = {
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoriesByType,
};
