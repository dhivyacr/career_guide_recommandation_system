const express = require("express");
const AdminNote = require("../models/adminNoteModel");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const notes = await AdminNote.find().sort({ createdAt: -1 });
    return res.json(notes);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin notes" });
  }
});

router.post("/", async (req, res) => {
  try {
    const note = await AdminNote.create(req.body);
    return res.json(note);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create admin note" });
  }
});

module.exports = router;
