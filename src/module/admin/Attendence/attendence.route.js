const express = require("express");
const multer = require("multer");
const authAdmin = require("../../../core/middleware/authAdmin");
const requireRole = require("../../../core/middleware/requireRole");
const requireFields = require("../../../core/middleware/requireFields");
const validateObjectIdParam = require("../../../core/middleware/validateObjectIdParam");
const attendenceController = require("./attendence.controller");

const router = express.Router();

// Admin-only for now (no IP restriction / employee auth in this module yet)
router.use(authAdmin, requireRole("admin"));

function fileToDataUri(file) {
  if (!file || !file.buffer) return null;
  const mime = file.mimetype || "application/octet-stream";
  return `data:${mime};base64,${file.buffer.toString("base64")}`;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    const mt = String(file?.mimetype || "");
    if (mt.startsWith("image/")) return cb(null, true);
    return cb(new Error("Unsupported file type"));
  }
});

function attachProfileImage(req, _res, next) {
  try {
    if (req.file) req.body.profile_image = fileToDataUri(req.file);
    next();
  } catch (err) {
    next(err);
  }
}

router.get("/", attendenceController.index);
router.get("/employee/:employee_id", validateObjectIdParam("employee_id"), attendenceController.showByEmployee);

router.post(
  "/mark-in",
  upload.single("profile_image"),
  attachProfileImage,
  requireFields(["employee_id"]),
  attendenceController.markIn
);
router.post(
  "/mark-out",
  upload.single("profile_image"),
  attachProfileImage,
  requireFields(["employee_id"]),
  attendenceController.markOut
);
router.post(
  "/break-start",
  upload.single("profile_image"),
  attachProfileImage,
  requireFields(["employee_id"]),
  attendenceController.breakStart
);
router.post(
  "/break-end",
  upload.single("profile_image"),
  attachProfileImage,
  requireFields(["employee_id"]),
  attendenceController.breakEnd
);

router.put(
  "/update/:id",
  validateObjectIdParam("id"),
  upload.single("profile_image"),
  attachProfileImage,
  requireFields(["employee_id"]),
  attendenceController.update
);
router.delete("/delete/:id", validateObjectIdParam("id"), attendenceController.destroy);

module.exports = router;
