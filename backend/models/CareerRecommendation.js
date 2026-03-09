const mongoose = require("mongoose");

const careerRecommendationSchema = new mongoose.Schema(
  {
    careerName: { type: String, required: true, trim: true },
    matchScore: { type: Number, default: 0 },
    education: { type: String, default: "" },
    interests: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerRecommendation", careerRecommendationSchema);
