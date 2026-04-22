const express = require("express");
const router = express.Router();
const profileController = require("./profileController");
const authVerify = require("../../../middleware/authVerify");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file?.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error("Only image files are allowed"));
  },
});

// Protected route to update profile
router.put("/update", authVerify, upload.single("profile_photo"), profileController.updateProfile);

module.exports = router;
