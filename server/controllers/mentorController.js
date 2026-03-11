const Mentor = require("../models/Mentor");
const Student = require("../models/Student");
const Feedback = require("../models/Feedback");

exports.getStudents = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ email: req.user.email });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const students = await Student.find({ mentorId: mentor._id }).sort({ createdAt: 1 });
    return res.json({ students });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { studentId, rating, feedbackText } = req.body;

    if (!studentId || !rating || !feedbackText) {
      return res.status(400).json({ message: "studentId, rating and feedbackText are required" });
    }

    const mentor = await Mentor.findOne({ email: req.user.email });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const student = await Student.findOne({ _id: studentId, mentorId: mentor._id });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const feedback = await Feedback.create({
      studentId: student._id,
      mentorId: mentor._id,
      feedbackText: String(feedbackText).trim(),
      rating: Number(rating)
    });

    student.feedbackHistory.push(feedback._id);
    await student.save();

    return res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
