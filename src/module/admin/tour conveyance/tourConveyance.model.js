const mongoose = require("mongoose");
const { Schema } = mongoose;

// Conveyance Detail Schema
const ConveyanceDetailSchema = new Schema({
  tour_conveyance: { type: Schema.Types.ObjectId, ref: "TourConveyance", required: true },
  travel_date: { type: Date, required: true },
  mode: { type: String, required: true },
  from_location: { type: String, required: true },
  to_location: { type: String, required: true },
  distance: { type: Number, required: true },
  amount: { type: Number, required: true },
});

// Tour Conveyance Schema
const TourConveyanceSchema = new Schema({
  company_name: { type: String, required: true },
  company_address: { type: String, required: true },
  company_logo_path: { type: String },
  form_heading: { type: String, required: true },
  form_subheading: { type: String },
  form_date: { type: Date, required: true },
  employee_name: { type: String, required: true },
  employee_id: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  reporting_manager: { type: String },
  cost_center: { type: String },
  purpose: { type: String },
  tour_location: { type: String },
  project_code: { type: String },
  tour_from: { type: Date },
  tour_to: { type: Date },
  advance_taken: { type: Number, default: 0 },
  total_expense: { type: Number, default: 0 },
  balance_payable: { type: Number, default: 0 },
  balance_receivable: { type: Number, default: 0 },
  manager_remarks: { type: String },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  footer_heading: { type: String },
  footer_subheading: { type: String },
}, { timestamps: true });

// Virtual field for conveyance details
TourConveyanceSchema.virtual("conveyance_details", {
  ref: "ConveyanceDetail",
  localField: "_id",
  foreignField: "tour_conveyance",
});

// Include virtuals in JSON
TourConveyanceSchema.set("toObject", { virtuals: true });
TourConveyanceSchema.set("toJSON", { virtuals: true });

const TourConveyance = mongoose.model("TourConveyance", TourConveyanceSchema);
const ConveyanceDetail = mongoose.model("ConveyanceDetail", ConveyanceDetailSchema);

module.exports = { TourConveyance, ConveyanceDetail };