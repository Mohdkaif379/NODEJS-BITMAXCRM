const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: { type: String },

    company_name: { type: String },

    status: {
      type: String,
      enum: ["open", "contacted", "qualified", "lost"],
      default: "open",
    },

    source: { type: String },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);