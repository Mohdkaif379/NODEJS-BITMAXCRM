const express = require("express");
const router = express.Router();
const controller = require("./interview.controller");
const upload = require("../../../core/utils/multer");

// CRUD
router.post("/", upload.single("candidateResume"), controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", upload.single("candidateResume"), controller.update);
router.delete("/:id", controller.delete);

// Rounds
router.post("/:id/round", controller.addRound);
router.put("/:id/round/:index", controller.updateRound);
router.delete("/:id/round/:index", controller.deleteRound);

module.exports = router;