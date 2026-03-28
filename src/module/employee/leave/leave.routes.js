const express = require("express");
const router = express.Router();
const upload = require("../../../core/middleware/upload.middleware");
const authVerify = require("../../../middleware/authVerify");


const {
  createLeave,
  getMyLeaves,
} = require("./leave.controller");


// CREATE LEAVE
router.post(
  "/apply",
  authVerify,
  upload.single("file"),
  (req, res, next) => {
    if (req.file) {
      req.body.file = req.file.path;
    }
    next();
  },
  createLeave
);
// GET MY LEAVES
router.get("/my", authVerify, getMyLeaves);

module.exports = router;