const express = require("express");
const visitorController = require("./visitor.controller");
const requireFields = require("../../../core/middleware/requireFields");
const authAdmin = require("../../../core/middleware/authAdmin");
const requireRole = require("../../../core/middleware/requireRole");
const validateObjectIdParam = require("../../../core/middleware/validateObjectIdParam");

const router = express.Router();

// Admin-only
router.use(authAdmin, requireRole("admin"));

router.post("/create", requireFields(["name", "email"]), visitorController.createVisitor);
router.get("/all", visitorController.listVisitors);
router.get("/:id", validateObjectIdParam("id"), visitorController.getVisitor);
router.put("/update/:id", validateObjectIdParam("id"), visitorController.updateVisitor);
router.delete("/delete/:id", validateObjectIdParam("id"), visitorController.deleteVisitor);

module.exports = router;
