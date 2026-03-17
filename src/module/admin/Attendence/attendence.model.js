const mongoose = require("mongoose");

const attendenceSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    // Stored as YYYY-MM-DD (Asia/Kolkata) to avoid timezone edge cases.
    date: { type: String, required: true, trim: true, index: true },

    mark_in: { type: String, default: null, trim: true }, // HH:mm:ss
    mark_out: { type: String, default: null, trim: true }, // HH:mm:ss
    break_start: { type: String, default: null, trim: true }, // HH:mm:ss
    break_end: { type: String, default: null, trim: true }, // HH:mm:ss

    first_mark_in: { type: String, default: null, trim: true },
    first_mark_out: { type: String, default: null, trim: true },
    first_break_start: { type: String, default: null, trim: true },
    first_break_end: { type: String, default: null, trim: true },

    profile_image: { type: String, default: null, trim: true, maxlength: 2048 },
    status: { type: String, default: "present", enum: ["present", "absent", "halfday", "holiday"] }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

attendenceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendence", attendenceSchema);
