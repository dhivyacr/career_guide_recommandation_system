const Student = require("../models/Student");
const { recommendCareer, recommendCareers } = require("../services/recommendationService");
const { findSkillGap } = require("../services/skillGapService");
const { getOrCreateWeeklyGoals } = require("../services/weeklyGoalService");
const { buildReadinessReport } = require("../services/readinessService");

async function getReadiness(req, res) {
  try {
    const requestedUserId = String(req.params?.userId || "");
    const currentUserId = String(req.user?.id || "");

    if (!requestedUserId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    if (req.user?.role !== "admin" && requestedUserId !== currentUserId) {
      return res.status(403).json({
        message: "Forbidden"
      });
    }

    const student = requestedUserId === currentUserId
      ? await Student.findOne({
          $or: [
            { userId: requestedUserId },
            { email: req.user?.email }
          ]
        })
      : await Student.findOne({ userId: requestedUserId });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const profile = {
      name: student.name,
      email: student.email,
      department: student.degree,
      degree: student.degree,
      year: student.year || "",
      careerGoal: student.careerGoal || "",
      cgpa: student.gpa,
      gpa: student.gpa,
      skills: student.technicalSkills || [],
      technicalSkills: student.technicalSkills || [],
      interests: student.interests || []
    };

    const recommendations = await recommendCareers(profile, { limit: 5 });
    const bestMatch = recommendations[0] || null;
    const career = bestMatch?.careerName || (await recommendCareer(profile));
    const skillGap = findSkillGap(profile, career);
    const weeklyGoal = await getOrCreateWeeklyGoals(student.userId || req.user.id, skillGap);
    const readinessReport = buildReadinessReport({
      student,
      bestMatch,
      weeklyGoal,
      career,
      skillGap
    });

    return res.json(readinessReport);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to calculate readiness"
    });
  }
}

module.exports = {
  getReadiness
};
