const Student = require("../models/Student");
const { recommendCareers } = require("../utils/careerRecommendation");

exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email })
      .populate("mentorId", "name email studentsAssigned")
      .populate({
        path: "feedbackHistory",
        populate: { path: "mentorId", select: "name email" }
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json(student);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const payload = {
      skills: Array.isArray(req.body?.skills) ? req.body.skills : [],
      interests: Array.isArray(req.body?.interests) ? req.body.interests : [],
      careerGoal: String(req.body?.careerGoal || "").trim(),
      performanceScore: Number(req.body?.performanceScore) || 0
    };

    const student = await Student.findOneAndUpdate({ email: req.user.email }, payload, {
      new: true,
      runValidators: true
    }).populate("mentorId", "name email studentsAssigned");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({ message: "Profile updated successfully", student });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.recommendCareer = async (req, res) => {
  try {
    const skills = Array.isArray(req.body?.skills) ? req.body.skills : [];
    const interests = Array.isArray(req.body?.interests) ? req.body.interests : [];
    const recommendations = recommendCareers({ skills, interests });

    if (req.user?.email) {
      await Student.findOneAndUpdate(
        { email: req.user.email },
        { recommendations: recommendations.map((item) => item.title) },
        { new: true }
      );
    }

    return res.json({
      recommendedCareer: recommendations[0]?.title || "Software Engineer",
      recommendations
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
