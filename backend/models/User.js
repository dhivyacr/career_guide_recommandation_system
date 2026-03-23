const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "student", "mentor", "faculty"], default: "student" },
    department: { type: String, trim: true, default: "" },
    departmentCode: { type: String, trim: true, lowercase: true, default: "" },
    batch: { type: String, trim: true, default: "" },
    year: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
