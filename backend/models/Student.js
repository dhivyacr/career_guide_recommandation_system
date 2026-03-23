const mongoose = require("mongoose");

const { Schema } = mongoose;

const studentSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, sparse: true, default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["student"], default: "student" },
    regNo: { type: String, unique: true, required: true, trim: true, alias: "registerNumber" },
    educationLevel: { type: String, default: "" },
    education: String,
    degree: { type: String, default: "", alias: "department" },
    year: { type: String, default: "" },
    gpa: { type: Number, default: 0, alias: "cgpa" },
    dob: { type: String, default: "" },
    graduation: String,
    technicalSkills: { type: [String], default: [], alias: "skills" },
    githubLink: { type: String, default: "" },
    linkedInLink: { type: String, default: "" },
    softSkills: [String],
    interests: { type: [String], default: [] },
    careerGoal: { type: String, default: "" },
    mentorId: { type: Schema.Types.ObjectId, ref: "Mentor", default: null },
    mentorName: { type: String, default: "" },
    profileComplete: { type: Boolean, default: false },
    profileCompleted: { type: Boolean, default: false },
    careerRecommendation: { type: String, default: "" },
    careerPath: { type: String, default: "" },
    skillGap: { type: [String], default: [] },
    performanceScore: { type: Number, default: 0 },
    feedbackHistory: {
      type: [{ type: Schema.Types.ObjectId, ref: "Feedback" }],
      default: []
    },
    mentorReview: { type: String, default: "" },
    mentorFeedback: { type: String, default: "" },
    mentorGuidance: {
      type: [
        {
          message: { type: String, default: "" },
          date: { type: Date, default: Date.now }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

studentSchema.set("toJSON", { virtuals: true });
studentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Student", studentSchema);
