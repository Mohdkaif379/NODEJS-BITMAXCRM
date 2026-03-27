const express = require("express");
const router = express.Router();
const TourConveyanceController = require("./tourConveyance.controller");

// CRUD Routes
router.post("/", TourConveyanceController.createTour);
router.get("/", TourConveyanceController.getAllTours);
router.get("/:id", TourConveyanceController.getTourById);
router.put("/:id", TourConveyanceController.updateTour);
router.delete("/:id", TourConveyanceController.deleteTour);

module.exports = router;