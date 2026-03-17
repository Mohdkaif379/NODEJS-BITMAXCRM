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

function fileToDataUri(file) {
  if (!file || !file.buffer) return null;
  const mime = file.mimetype || "application/octet-stream";
  return `data:${mime};base64,${file.buffer.toString("base64")}`;
}

function attachEmployeeFiles(req, _res, next) {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    for (const file of files) {
      // file.fieldname can be: profile_photo, family_details[0][aadhar_profile], documents[0][file], etc.
      const key = file.fieldname;
      if (!key) continue;
      // Put into body using the same key; parseNestedFormData will nest it.
      req.body[key] = fileToDataUri(file);
    }
    next();
  } catch (err) {
    next(err);
  }
}

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
  attachEmployeeFiles,
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
  attachEmployeeFiles,
  parseNestedFormData,
  employeeController.updateEmployee
);
router.delete("/delete/:id", validateObjectIdParam("id"), employeeController.deleteEmployee);

module.exports = router;
