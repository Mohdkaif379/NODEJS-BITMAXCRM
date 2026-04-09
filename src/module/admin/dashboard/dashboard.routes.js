const express = require("express");
const router = express.Router();

const dashboardController = require("./dashboard.controller");

// ✅ Middleware (already in your project)
const authAdmin = require("../../../core/middleware/authAdmin");

// 🔹 Only admin access
router.get(
  "/recent-employees",
  authAdmin,
  dashboardController.getRecentEmployees
);

router.get(
  "/recent-leaves",
  authAdmin,
  dashboardController.getRecentLeaves
);

module.exports = router;