const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: String,
    regNo: { type: String, required: true, unique: true, trim: true },
    education: String,
    degree: String,
    gpa: String,
    graduation: String,
    technicalSkills: [String],
    softSkills: [String],
    interests: [String],
    careerGoal: String,
    mentorReview: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
