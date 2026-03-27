const mongoose = require("mongoose");

const interviewRoundSchema = new mongoose.Schema(
  {
    roundName: {
      type: String,
      required: true,
    },
    remark: {
      type: String,
    },
    interviewerName: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    jobProfile: {
      type: String,
      required: true,
    },
    scheduleAt: {
      type: String,
    },
    location: {
      type: String,
    },

    candidateName: {
      type: String,
      required: true,
    },
    candidateEmail: {
      type: String,
      required: true,
    },
    candidatePhone: {
      type: String,
      required: true,
    },

    experience: {
      type: Number,
    },

    interviewDate: {
      type: Date,
    },
    interviewTime: {
      type: String,
    },

    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },

    result: {
      type: String,
      enum: ["PENDING", "SELECTED", "REJECTED"],
      default: "PENDING",
    },

    candidateResume: {
      type: String, // file path
    },

    finalFeedback: {
      type: String,
    },

    interviewRounds: [interviewRoundSchema], // embedded array
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);