const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
      index: true
    },
    phone: { type: String, default: null, trim: true, maxlength: 255 },

    contact_person_name: { type: String, default: null, trim: true, maxlength: 255 },
    contact_person_phone: { type: String, default: null, trim: true, maxlength: 255 },

    purpose: { type: String, default: null, trim: true, maxlength: 255 },
    visit_date: { type: Date, default: null },

    invite_code: { type: String, required: true, trim: true, maxlength: 255, index: true }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

module.exports = mongoose.model("Visitor", visitorSchema);
