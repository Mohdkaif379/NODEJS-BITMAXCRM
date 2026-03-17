const express = require("express");
const multer = require("multer");
const subadminController = require("./subadmin.controller");
const stripRoleField = require("../../core/middleware/stripRoleField");
const requireFields = require("../../core/middleware/requireFields");
const authAdmin = require("../../core/middleware/authAdmin");
const validateAuthSubObjectId = require("../../core/middleware/validateAuthSubObjectId");
const requireRole = require("../../core/middleware/requireRole");
const validateObjectIdParam = require("../../core/middleware/validateObjectIdParam");

const router = express.Router();

function fileToDataUri(file) {
  if (!file || !file.buffer) return null;
  const mime = file.mimetype || "application/octet-stream";
  return `data:${mime};base64,${file.buffer.toString("base64")}`;
}

function attachSubadminImages(req, _res, next) {
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file?.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error("Only image files are allowed"));
  }
});

router.post("/login", requireFields(["email", "password"]), subadminController.login);

router.post(
  "/create",
  authAdmin,
  requireRole("admin"),
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "company_logo", maxCount: 1 }
  ]),
  stripRoleField,
  attachSubadminImages,
  requireFields(["full_name", "email", "password"]),
  subadminController.createSubadmin
);

// Admin-only list
router.get("/all", authAdmin, requireRole("admin"), subadminController.listSubadmins);

// Subadmin self profile (token `sub`)
router.get("/profile", authAdmin, requireRole("subadmin"), validateAuthSubObjectId, subadminController.getSubadmin);

// Admin views subadmin by id
router.get("/profile/:id", authAdmin, requireRole("admin"), validateObjectIdParam("id"), subadminController.getSubadmin);
router.put(
  "/update",
  authAdmin,
  requireRole("subadmin"),
  validateAuthSubObjectId,
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "company_logo", maxCount: 1 }
  ]),
  stripRoleField,
  attachSubadminImages,
  subadminController.updateSubadmin
);
// Admin updates subadmin by id
router.put(
  "/update/:id",
  authAdmin,
  requireRole("admin"),
  validateObjectIdParam("id"),
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "company_logo", maxCount: 1 }
  ]),
  stripRoleField,
  attachSubadminImages,
  subadminController.updateSubadmin
);

router.delete("/delete", authAdmin, requireRole("subadmin"), validateAuthSubObjectId, subadminController.deleteSubadmin);
router.delete("/delete/:id", authAdmin, requireRole("admin"), validateObjectIdParam("id"), subadminController.deleteSubadmin);

router.use((err, _req, res, next) => {
  if (!err) return next();
  if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ message: "File too large (max 5MB)" });
  return res.status(400).json({ message: err.message || "Upload error" });
});

module.exports = router;
