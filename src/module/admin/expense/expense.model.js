const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 255, index: true },
    category: { type: String, required: true, trim: true, maxlength: 255, index: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, index: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true, index: true }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

expenseSchema.index({ created_at: -1 });

module.exports = mongoose.model("Expense", expenseSchema);
