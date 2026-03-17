const mongoose = require("mongoose");

const employeeBankSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    bank_name: { type: String, required: true, trim: true, maxlength: 255 },
    account_number: { type: String, required: true, trim: true, maxlength: 255 },
    ifsc_code: { type: String, required: true, trim: true, maxlength: 255 },
    branch_name: { type: String, default: null, trim: true, maxlength: 255 }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("EmployeeBankDetails", employeeBankSchema);
