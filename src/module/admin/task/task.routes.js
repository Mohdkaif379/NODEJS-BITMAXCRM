const express = require("express");
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("./task.controller");

const adminAuth = require("../../../core/middleware/authAdmin");

// CREATE
router.post("/create", adminAuth, createTask);

// GET ALL
router.get("/all", adminAuth, getAllTasks);

// GET ONE
router.get("/:id", adminAuth, getTaskById);

// UPDATE
router.put("/:id", adminAuth, updateTask);

// DELETE
router.delete("/:id", adminAuth, deleteTask);

module.exports = router;