const express = require("express");
const router = express.Router();

const adminAuth = require("../../../core/middleware/authAdmin");

// 🔥 file upload (multer)
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});
const {
  createProposalController,
  getAllProposalsController,
  getProposalByIdController,
  updateProposalController,
  deleteProposalController,
} = require("./proposal.controller");

// 🔥 Admin protected routes
router.post("/", adminAuth, upload.single("file"), createProposalController);
router.get("/", adminAuth, getAllProposalsController);
router.get("/:id", adminAuth, getProposalByIdController);
router.put("/:id", adminAuth, updateProposalController);
router.delete("/:id", adminAuth, deleteProposalController);

module.exports = router;