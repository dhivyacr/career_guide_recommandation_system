const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    studentsAssigned: { type: Number, default: 0 },
    students: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mentor", mentorSchema);
