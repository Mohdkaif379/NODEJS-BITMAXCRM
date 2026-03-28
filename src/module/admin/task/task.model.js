const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    task_name: {
      type: String,
      required: true,
      trim: true,
    },

    assignment_type: {
      type: String,
      required: true,
      trim: true,
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "progress", "completed"],
      default: "pending",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);