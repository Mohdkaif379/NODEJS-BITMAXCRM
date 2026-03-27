const TourConveyanceService = require("./tourConveyance.service");

class TourConveyanceController {

  static async createTour(req, res) {
    try {
      const tour = await TourConveyanceService.createTourConveyance(req.body);
      res.status(201).json(tour);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAllTours(req, res) {
    try {
      const tours = await TourConveyanceService.getAllTours();
      res.json(tours);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTourById(req, res) {
    try {
      const tour = await TourConveyanceService.getTourById(req.params.id);
      res.json(tour);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async updateTour(req, res) {
    try {
      const tour = await TourConveyanceService.updateTour(req.params.id, req.body);
      res.json(tour);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteTour(req, res) {
    try {
      await TourConveyanceService.deleteTour(req.params.id);
      res.json({ message: "Tour Conveyance deleted successfully" });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = TourConveyanceController;