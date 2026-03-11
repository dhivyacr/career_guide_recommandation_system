const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true
    },
    name: {
      type: String,
      default: "",
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    registerNumber: {
      type: String,
      default: "",
      trim: true
    },
    department: {
      type: String,
      default: "",
      trim: true
    },
    cgpa: {
      type: Number,
      default: 0
    },
    skills: {
      type: [String],
      default: []
    },
    interests: {
      type: [String],
      default: []
    },
    careerRecommendation: {
      type: String,
      default: ""
    },
    skillGap: {
      type: [String],
      default: []
    },
    mentorFeedback: {
      type: String,
      default: ""
    },
    careerGoal: {
      type: String,
      default: ""
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      default: null
    },
    performanceScore: {
      type: Number,
      default: 0
    },
    recommendations: {
      type: [String],
      default: []
    },
    feedbackHistory: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feedback" }],
      default: []
    },
    adminGuidance: {
      type: String,
      default: ""
    },
    mentorGuidance: {
      type: [
        {
          message: { type: String, required: true },
          date: { type: Date, default: Date.now }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
