const express = require("express");
const multer = require("multer");
const adminController = require("./admin.controller");
const stripPrivilegedAdminFields = require("../../../core/middleware/stripPrivilegedAdminFields");
const requireFields = require("../../../core/middleware/requireFields");
const validateObjectIdParam = require("../../../core/middleware/validateObjectIdParam");
const authAdmin = require("../../../core/middleware/authAdmin");
const validateAuthSubObjectId = require("../../../core/middleware/validateAuthSubObjectId");

const router = express.Router();

function fileToDataUri(file) {
  if (!file || !file.buffer) return null;
  const mime = file.mimetype || "application/octet-stream";
  return `data:${mime};base64,${file.buffer.toString("base64")}`;
}

function attachAdminImages(req, _res, next) {
  try {
    const files = req.files || {};

    const profile = Array.isArray(files.profile_photo) ? files.profile_photo[0] : null;
    const company = Array.isArray(files.company_logo) ? files.company_logo[0] : null;

    if (profile) req.body.profile_photo = fileToDataUri(profile);
    if (company) req.body.company_logo = fileToDataUri(company);

    return next();
  } catch (err) {
    return next(err);
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter(_req, file, cb) {
    if (file?.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error("Only image files are allowed"));
  }
});

router.post("/login", requireFields(["email", "password"]), adminController.login);

router.post(
  "/create",
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "company_logo", maxCount: 1 }
  ]),
  stripPrivilegedAdminFields,
  attachAdminImages,
  requireFields(["full_name", "email", "password"]),
  adminController.createAdmin
);
router.get("/all", authAdmin, adminController.listAdmins);
// Self profile (no id in route) - id taken from JWT `sub`
router.get("/profile", authAdmin, validateAuthSubObjectId, adminController.getAdmin);

router.put(
  "/update",
  authAdmin,
  validateAuthSubObjectId,
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "company_logo", maxCount: 1 }
  ]),
  stripPrivilegedAdminFields,
  attachAdminImages,
  adminController.updateAdmin
);
// Optional: update by id

router.delete("/delete", authAdmin, validateAuthSubObjectId, adminController.deleteAdmin);

router.use((err, _req, res, next) => {
  if (!err) return next();
  if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ message: "File too large (max 5MB)" });
  return res.status(400).json({ message: err.message || "Upload error" });
});

module.exports = router;
