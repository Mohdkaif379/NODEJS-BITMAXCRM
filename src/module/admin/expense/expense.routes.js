const express = require("express");
const router = express.Router();

const {
  createExpenseController,
  getAllExpensesController,
  getSingleExpenseController,
  updateExpenseController,
  deleteExpenseController,
} = require("./expense.controller");

const authAdmin = require("../../../core/middleware/authAdmin");

router.post("/create", authAdmin, createExpenseController);
router.get("/all", authAdmin, getAllExpensesController);
router.get("/:id", authAdmin, getSingleExpenseController);
router.put("/update/:id", authAdmin, updateExpenseController);
router.delete("/delete/:id", authAdmin, deleteExpenseController);

module.exports = router;