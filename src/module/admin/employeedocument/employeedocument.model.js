const mongoose = require("mongoose");

const employeeDocumentSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    document_type: { type: String, required: true, trim: true, maxlength: 255 },
    file: { type: String, required: true, trim: true, maxlength: 2048 }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("EmployeeDocuments", employeeDocumentSchema);
