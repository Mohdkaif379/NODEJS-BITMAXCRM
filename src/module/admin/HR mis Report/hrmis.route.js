const express = require("express");
const router = express.Router();

const controller = require("./hrmis.controller");

// 🔥 auth middleware
const authAdmin = require("../../../core/middleware/authAdmin");

// CRUD
router.post("/", authAdmin, controller.create);
router.get("/", authAdmin, controller.getAll);
router.get("/:id", authAdmin, controller.getById);
router.put("/:id", authAdmin, controller.update);
router.delete("/:id", authAdmin, controller.delete);

module.exports = router;