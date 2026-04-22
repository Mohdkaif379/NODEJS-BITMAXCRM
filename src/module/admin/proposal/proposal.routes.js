const express = require("express");
const router = express.Router();

const adminAuth = require("../../../core/middleware/authAdmin");

const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
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

router.post("/", adminAuth, upload.single("file"), createProposalController);
router.get("/", adminAuth, getAllProposalsController);
router.get("/:id", adminAuth, getProposalByIdController);
router.put("/:id", adminAuth, upload.single("file"), updateProposalController);
router.delete("/:id", adminAuth, deleteProposalController);

module.exports = router;
