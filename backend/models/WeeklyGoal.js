const mongoose = require("mongoose");

const { Schema } = mongoose;

const weeklyGoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    goalTitle: { type: String, required: true, trim: true },
    skill: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    cycleStartedAt: { type: Date, required: true, index: true },
    cycleEndsAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeeklyGoal", weeklyGoalSchema);
