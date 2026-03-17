const mongoose = require("mongoose");

const employeeQualificationSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    degree: { type: String, required: true, trim: true, maxlength: 255 },
    institution: { type: String, required: true, trim: true, maxlength: 255 },
    passing_year: { type: String, default: null, trim: true, maxlength: 50 },
    grade: { type: String, default: null, trim: true, maxlength: 50 }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("EmployeeQualification", employeeQualificationSchema);
