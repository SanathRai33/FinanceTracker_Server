const express = require("express");
const router = express.Router();

const { authGuard } = require("../middlewares/auth.middleware");
const goalCtrl = require("../controllers/savingsGoal.controller");

router.use(authGuard);

router.post("/", goalCtrl.addSavingsGoal);
router.get("/", goalCtrl.getAllSavingsGoals);

router.get("/completed", goalCtrl.getCompletedSavingsGoals);
router.get("/active", goalCtrl.getActiveSavingsGoals);

router.patch("/:id/progress", goalCtrl.updateSavingsProgress);

router
  .route("/:id")
  .get(goalCtrl.getSavingsGoalById)
  .put(goalCtrl.updateSavingsGoal)
  .delete(goalCtrl.deleteSavingsGoal);

module.exports = router;
