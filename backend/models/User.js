const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false, default: null },
    role: { type: String, enum: ["admin", "student", "mentor", "faculty"], default: "student" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
