const mongoose = require("mongoose");

const hrmisSchema = new mongoose.Schema(
  {
    report_type: String,
    department: String,
    report_date: Date,
    report_month: String,
    report_year: String,
    center_name: String,
    week_start_date: Date,
    week_end_date: Date,

    total_employees: Number,
    new_hires: Number,
    terminations: Number,
    resignations: Number,
    strength: Number,

    total_present: Number,
    total_absent: Number,
    total_leave: Number,
    total_halfday: Number,
    total_holiday: Number,

    requirement_raised: Number,
    position_pending: Number,
    position_closed: Number,

    interviews_conducted: Number,
    selected: Number,
    rejected: Number,

    process: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },

    salary_disbursement_date: Date,
    deduction: String,
    pending_compliance: String,

    grievance_received: { type: Number, default: 0 },
    grievance_resolved: { type: Number, default: 0 },
    warning_notice: { type: Number, default: 0 },
    appreciation: { type: Number, default: 0 },

    training_conducted: { type: Number, default: 0 },
    employee_attend: { type: Number, default: 0 },
    training_feedback: String,

    birthday_celebration: String,
    engagement_activities: String,
    hr_initiatives: String,
    special_events: String,

    notes: String,
    remarks: String,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HRMIS", hrmisSchema);