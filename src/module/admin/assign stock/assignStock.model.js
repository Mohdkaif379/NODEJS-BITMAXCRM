const mongoose = require("mongoose");

const assignStockSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    stock_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },

    assign_quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    assign_date: {
      type: Date,
      default: Date.now,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignStock", assignStockSchema);