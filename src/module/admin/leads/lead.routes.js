const express = require("express");
const router = express.Router();

const adminAuth = require("../../../core/middleware/authAdmin");

const {
  createLeadController,
  getAllLeadsController,
  getLeadByIdController,
  updateLeadController,
  deleteLeadController,
} = require("./lead.controller");

// CRUD ROUTES
router.post("/", adminAuth, createLeadController);
router.get("/", adminAuth, getAllLeadsController); // 🔥 with filter
router.get("/:id", adminAuth, getLeadByIdController);
router.put("/:id", adminAuth, updateLeadController);
router.delete("/:id", adminAuth, deleteLeadController);

module.exports = router;