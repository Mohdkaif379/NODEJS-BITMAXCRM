const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  status: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  }
}, { timestamps: true });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;