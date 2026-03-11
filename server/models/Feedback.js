const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
    feedbackText: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
