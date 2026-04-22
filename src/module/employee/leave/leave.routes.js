const express = require("express");
const router = express.Router();
const upload = require("../../../core/middleware/upload.middleware");
const authVerify = require("../../../middleware/authVerify");
const { uploadMulterFile } = require("../../../core/config/cloudinary");


const {
  createLeave,
  getMyLeaves,
} = require("./leave.controller");


// CREATE LEAVE
router.post(
  "/apply",
  authVerify,
  upload.single("file"),
  async (req, res, next) => {
    try {
      req.body.file = await uploadMulterFile(req.file, {
        folder: "bitmax/leaves/files",
        resource_type: "auto",
      });
      next();
    } catch (error) {
      next(error);
    }
  },
  createLeave
);
// GET MY LEAVES
router.get("/my", authVerify, getMyLeaves);

module.exports = router;
