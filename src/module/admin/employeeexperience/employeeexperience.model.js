const mongoose = require("mongoose");

const employeeExperienceSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    company_name: { type: String, required: true, trim: true, maxlength: 255 },
    position: { type: String, required: true, trim: true, maxlength: 255 },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("EmployeeExperience", employeeExperienceSchema);
