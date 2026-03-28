const express = require("express");
const router = express.Router();
const { markInController, markOutController,startBreakController, endBreakController } = require("./attendence.controller");
const upload = require("../../../core/middleware/upload.middleware");

// Mark In
router.post("/mark-in", upload.single("profile_image"), markInController);

// Mark Out (requires image and status in body)
router.post("/mark-out", upload.single("profile_image"), markOutController);
// Start Break
router.post("/break-start", upload.single("profile_image"), startBreakController);

// End Break
router.post("/break-end", upload.single("profile_image"), endBreakController);


module.exports = router;