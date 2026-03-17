const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    emp_code: { type: String, required: true, trim: true, maxlength: 255, unique: true },
    emp_name: { type: String, required: true, trim: true, maxlength: 255 },
    emp_email: { type: String, required: true, trim: true, lowercase: true, maxlength: 255, unique: true },
    emp_phone: { type: String, required: true, trim: true, maxlength: 255 },

    joining_date: { type: Date, default: null },
    dob: { type: Date, default: null },
    position: { type: String, default: null, trim: true, maxlength: 255 },
    department: { type: String, default: null, trim: true, maxlength: 255 },

    status: { type: Number, default: 1, enum: [0, 1] },
    role: { type: String, default: "employee", trim: true, maxlength: 255 },

    profile_photo: { type: String, default: null, trim: true, maxlength: 1024 },
    password: { type: String, required: true, select: false }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Employee", employeeSchema);
