const mongoose = require("mongoose");

const leadInteractionSchema = new mongoose.Schema(
  {
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },

    // 🔥 NEW FIELD
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    interaction_type: {
      type: String,
      enum: ["call", "email", "meeting", "whatsapp", "other"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    interaction_date: {
      type: Date,
      default: Date.now,
    },

    interaction_status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "pending",
    },

    next_followup_date: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeadInteraction", leadInteractionSchema);