const express = require("express");
const router = express.Router();

const { firebaseSessionMiddleware } = require("../middlewares/auth.middleware");
const catCtrl = require("../controllers/category.controller");

router.use(firebaseSessionMiddleware);

router.post("/", catCtrl.addCategory);
router.get("/", catCtrl.getAllCategories);
router.get("/type/:type", catCtrl.getCategoriesByType);

router
  .route("/:id")
  .put(catCtrl.updateCategory)
  .delete(catCtrl.deleteCategory);

module.exports = router;
