const express = require("express");
const router = express.Router();

const {
  createAssignStock,
  updateAssignStock,
  getAllAssignStock,
  getAssignStockById,
  deleteAssignStock,
} = require("./assignStock.controller");

const adminAuth = require("../../../core/middleware/authAdmin");

// CREATE
router.post("/create", adminAuth, createAssignStock);

// UPDATE 🔥
router.put("/update/:id", adminAuth, updateAssignStock);

// GET ALL
router.get("/all", adminAuth, getAllAssignStock);

// GET ONE
router.get("/:id", adminAuth, getAssignStockById);

// DELETE
router.delete("/:id", adminAuth, deleteAssignStock);

module.exports = router;