const express = require("express");
const router = express.Router();

const {
  createAssignTask,
  getAllAssignTask,
} = require("./assignTask.controller");

const adminAuth = require("../../../core/middleware/authAdmin");

// CREATE
router.post("/create", adminAuth, createAssignTask);

// GET ALL
router.get("/all", adminAuth, getAllAssignTask);

module.exports = router;