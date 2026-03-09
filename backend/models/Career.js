const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema(
  {
    careerName: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    salaryRange: { type: String, default: "" },
    demandLevel: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    industry: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Career", careerSchema);
