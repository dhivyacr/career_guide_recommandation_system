const Student = require("../models/Student");
const { recommendCareer, recommendCareers } = require("../services/recommendationService");
const { buildSkillAnalytics, findSkillGap } = require("../services/skillGapService");
const { getOrCreateWeeklyGoals, toggleWeeklyGoal } = require("../services/weeklyGoalService");
const { buildReadinessReport } = require("../services/readinessService");

function mapStudent(student) {
  return {
    ...student.toObject(),
    registerNumber: student.regNo || "",
    department: student.degree || "",
    cgpa: Number.parseFloat(student.gpa) || 0,
    skills: student.technicalSkills || [],
    interests: student.interests || [],
    mentorName: student.mentorName || "Unassigned",
    adminGuidance: student.mentorFeedback || student.mentorReview || "",
    mentorGuidance: student.mentorGuidance || []
  };
}

async function buildDashboardInsights(student, userId) {
  const profile = {
    name: student.name,
    department: student.degree,
    degree: student.degree,
    year: student.year || "",
    email: student.email || "",
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
  const skillMetrics = buildSkillAnalytics(profile, career);
  const skillGap = findSkillGap(profile, career);
  const weeklyGoal = await getOrCreateWeeklyGoals(userId, skillGap);
  const readinessReport = buildReadinessReport({
    student,
    bestMatch,
    weeklyGoal,
    career,
    skillGap
  });
  const readiness = readinessReport.readinessScore;

  return {
    career,
    skillGap,
    bestMatch,
    recommendations,
    skillMetrics,
    readiness,
    readinessReport,
    weeklyGoal
  };
}

async function getDashboard(req, res) {
  try {
    let student = await Student.findOne({
      $or: [
        { userId: req.user.id },
        { email: req.user.email }
      ]
    });

    if (!student) {
      student = await Student.create({
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        educationLevel: "",
        technicalSkills: [],
        interests: [],
        careerGoal: "",
        profileCompleted: false,
        role: "student"
      });
    }

    if (!student.userId) {
      student.userId = req.user.id;
      await student.save();
    }

    if (!student.regNo) {
      return res.json({
        message: "Profile incomplete",
        profileCompleted: false,
        student: mapStudent(student)
      });
    }

    const {
      career,
      skillGap,
      bestMatch,
      recommendations,
      skillMetrics,
      readiness,
      readinessReport,
      weeklyGoal
    } = await buildDashboardInsights(student, req.user.id);

    student.careerRecommendation = career;
    student.skillGap = skillGap;
    await student.save();

    return res.json({
      student: mapStudent(student),
      career,
      skillGap,
      bestMatch,
      recommendations,
      analytics: {
        skillMetrics,
        readiness,
        readinessReport,
        weeklyGoal
      },
      adminGuidance: student.mentorFeedback || student.mentorReview || "",
      mentorGuidance: student.mentorGuidance || []
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate dashboard insights"
    });
  }
}

async function updateWeeklyGoal(req, res) {
  try {
    const { goalId } = req.params;
    const completed = Boolean(req.body?.completed);
    const weeklyGoal = await toggleWeeklyGoal(req.user.id, goalId, completed);

    if (!weeklyGoal) {
      return res.status(404).json({
        message: "Weekly goal not found"
      });
    }

    const student = await Student.findOne({
      $or: [
        { userId: req.user.id },
        { email: req.user.email }
      ]
    });

    const { readinessReport } = await buildDashboardInsights(student, req.user.id);

    return res.json({
      weeklyGoal,
      readinessReport
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update weekly goal"
    });
  }
}

module.exports = {
  getDashboard,
  updateWeeklyGoal
};
