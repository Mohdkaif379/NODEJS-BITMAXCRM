const mongoose = require("mongoose");

const employeePayrollSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    basic_salary: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    conveyance_allowance: { type: Number, default: 0 },
    medical_allowance: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("EmployeePayroll", employeePayrollSchema);
