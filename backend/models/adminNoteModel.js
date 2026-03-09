const mongoose = require("mongoose");

const adminNoteSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AdminNote", adminNoteSchema);
