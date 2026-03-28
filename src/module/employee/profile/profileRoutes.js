const express = require("express");
const router = express.Router();
const profileController = require("./profileController");
const authVerify = require("../../../middleware/authVerify");
const multer = require("multer");

// Multer setup for profile image
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// Protected route to update profile
router.put("/update", authVerify, upload.single("profile_photo"), profileController.updateProfile);

module.exports = router;