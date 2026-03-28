const express = require("express");
const router = express.Router();

const {
  createStock,
  getAllStock,
  getStockById,
  updateStock,
  deleteStock,
} = require("./stock.controller");

const adminAuth = require("../../../core/middleware/authAdmin");

// CREATE
router.post("/create", adminAuth, createStock);

// GET ALL
router.get("/all", adminAuth, getAllStock);

// GET ONE
router.get("/:id", adminAuth, getStockById);

// UPDATE
router.put("/:id", adminAuth, updateStock);

// DELETE
router.delete("/:id", adminAuth, deleteStock);

module.exports = router;