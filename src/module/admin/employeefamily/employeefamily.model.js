const mongoose = require("mongoose");

const employeeFamilySchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    relationship: { type: String, required: true, trim: true, maxlength: 255 },
    contact: { type: String, default: null, trim: true, maxlength: 255 },

    aadhar_number: { type: String, default: null, trim: true, maxlength: 255 },
    aadhar_profile: { type: String, default: null, trim: true, maxlength: 1024 },
    pan_number: { type: String, default: null, trim: true, maxlength: 255 },
    pan_profile: { type: String, default: null, trim: true, maxlength: 1024 }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("EmployeeFamilyDetails", employeeFamilySchema);
