const express = require("express");
const router = express.Router();

const adminAuth = require("../../../core/middleware/authAdmin");

const {
  createInteractionController,
  getAllInteractionsController,
  getInteractionByIdController,
  updateInteractionController,
  deleteInteractionController,
} = require("./leadInteraction.controller");

// 🔥 Protected routes
router.post("/", adminAuth, createInteractionController);
router.get("/", adminAuth, getAllInteractionsController);
router.get("/:id", adminAuth, getInteractionByIdController);
router.put("/:id", adminAuth, updateInteractionController);
router.delete("/:id", adminAuth, deleteInteractionController);

module.exports = router;