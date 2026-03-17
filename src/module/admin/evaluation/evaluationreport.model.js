const mongoose = require("mongoose");

const evaluationReportSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },

    period_to: { type: Date, required: true },
    period_from: { type: Date, required: true },
    evaluation_date: { type: Date, required: true, index: true },

    delivery_updates: { type: String, required: true, trim: true, maxlength: 255 },
    quality_standards: { type: String, required: true, trim: true, maxlength: 255 },
    application_performance: { type: String, required: true, trim: true, maxlength: 255 },
    completion_accuracy: { type: String, required: true, trim: true, maxlength: 255 },
    innovation_problems: { type: String, required: true, trim: true, maxlength: 255 },

    task_efficiency: { type: Number, required: true, min: 0 },
    ui_ux_completion: { type: Number, required: true, min: 0 },
    debug_testing: { type: Number, required: true, min: 0 },
    version_control: { type: Number, required: true, min: 0 },
    document_quality: { type: Number, required: true, min: 0 },

    manager_comments: { type: String, required: true },
    collaboration_teamwork: { type: String, required: true, trim: true, maxlength: 255 },
    communicate_reports: { type: String, required: true, trim: true, maxlength: 255 },
    attendence_punctuality: { type: String, required: true, trim: true, maxlength: 255 },

    professionalism: { type: Number, required: true, min: 0 },
    team_collaboration: { type: Number, required: true, min: 0 },
    learning_adaptability: { type: Number, required: true, min: 0 },
    initiate_ownership: { type: Number, required: true, min: 0 },
    team_management: { type: Number, required: true, min: 0 },

    hr_comments: { type: String, required: true },

    skills: { type: Number, required: true, min: 0 },
    task_delivery: { type: Number, required: true, min: 0 },
    quality_work: { type: Number, required: true, min: 0 },
    communication: { type: Number, required: true, min: 0 },
    behaviour_teamwork: { type: Number, required: true, min: 0 },

    performance_grade: { type: String, required: true, trim: true, maxlength: 100, index: true },
    final_feedback: { type: String, required: true },

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

evaluationReportSchema.index({ employee_id: 1, created_at: -1 });

module.exports = mongoose.model("EvaluationReport", evaluationReportSchema);
