const express = require("express");
const router = express.Router();

const { authGuard } = require("../middlewares/auth.middleware");
const debtCtrl = require("../controllers/debtRecord.controller");

router.use(authGuard);

router.post("/", debtCtrl.addDebtRecord);
router.get("/", debtCtrl.getAllDebtRecords);

router.get("/pending", debtCtrl.getPendingDebts);
router.get("/paid", debtCtrl.getPaidDebts);

router
  .route("/:id")
  .get(debtCtrl.getDebtRecordById)
  .put(debtCtrl.updateDebtRecord)
  .delete(debtCtrl.deleteDebtRecord);

module.exports = router;
