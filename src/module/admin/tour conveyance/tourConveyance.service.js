const { TourConveyance, ConveyanceDetail } = require("./tourConveyance.model");

class TourConveyanceService {

  // Create Tour + Details
  static async createTourConveyance(data) {
    const { conveyance_details, ...tourData } = data;
    const tour = await TourConveyance.create(tourData);

    if (conveyance_details && conveyance_details.length) {
      const details = conveyance_details.map(item => ({ ...item, tour_conveyance: tour._id }));
      await ConveyanceDetail.insertMany(details);
    }

    // Return tour with populated details
    return TourConveyance.findById(tour._id).populate("conveyance_details");
  }

  // Get all tours with details
  static async getAllTours() {
    return TourConveyance.find().sort({ createdAt: -1 }).populate("conveyance_details");
  }

  // Get tour by ID with details
  static async getTourById(id) {
    const tour = await TourConveyance.findById(id).populate("conveyance_details");
    if (!tour) throw new Error("Tour not found");
    return tour;
  }

  // Update tour + details
  static async updateTour(id, data) {
    const { conveyance_details, ...tourData } = data;
    const tour = await TourConveyance.findByIdAndUpdate(id, tourData, { new: true });
    if (!tour) throw new Error("Tour not found");

    if (conveyance_details && conveyance_details.length) {
      await ConveyanceDetail.deleteMany({ tour_conveyance: id });
      const details = conveyance_details.map(item => ({ ...item, tour_conveyance: id }));
      await ConveyanceDetail.insertMany(details);
    }

    return TourConveyance.findById(id).populate("conveyance_details");
  }

  // Delete tour + details
  static async deleteTour(id) {
    const tour = await TourConveyance.findByIdAndDelete(id);
    if (!tour) throw new Error("Tour not found");

    await ConveyanceDetail.deleteMany({ tour_conveyance: id });
    return true;
  }
}

module.exports = TourConveyanceService;