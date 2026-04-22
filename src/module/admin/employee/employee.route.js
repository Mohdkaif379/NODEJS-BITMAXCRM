const express = require("express");
const multer = require("multer");
const employeeController = require("./employee.controller");
const requireFields = require("../../../core/middleware/requireFields");
const authAdmin = require("../../../core/middleware/authAdmin");
const requireRole = require("../../../core/middleware/requireRole");
const validateObjectIdParam = require("../../../core/middleware/validateObjectIdParam");
const parseNestedFormData = require("../../../core/middleware/parseNestedFormData");

const router = express.Router();

// Admin-only
router.use(authAdmin, requireRole("admin"));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 30 },
  fileFilter(_req, file, cb) {
    const mt = String(file?.mimetype || "");
    const ok =
      mt.startsWith("image/") ||
      mt === "application/pdf" ||
      mt === "application/msword" ||
      mt === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (ok) return cb(null, true);
    return cb(new Error("Unsupported file type"));
  }
});

router.post(
  "/create",
  upload.any(),
  parseNestedFormData,
  requireFields(["emp_name", "emp_email", "emp_phone", "password"]),
  employeeController.createEmployee
);
router.get("/all", employeeController.listEmployees);
router.get("/:id", validateObjectIdParam("id"), employeeController.getEmployee);
router.put(
  "/update/:id",
  validateObjectIdParam("id"),
  upload.any(),
  parseNestedFormData,
  employeeController.updateEmployee
);
router.delete("/delete/:id", validateObjectIdParam("id"), employeeController.deleteEmployee);

module.exports = router;
