const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },

    proposal_amount: {
      type: Number,
      required: true,
    },

    proposal_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // 🔥 file (any format)
    file: {
      type: String, // file path / URL
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Proposal", proposalSchema);