const Student = require("../models/Student");
const { recommendCareer, recommendCareers } = require("../services/recommendationService");
const { buildSkillAnalytics, calculateReadiness, findSkillGap } = require("../services/skillGapService");
const { generateLearningPath } = require("../services/learningPathService");

function mapStudent(student) {
  return {
    ...student.toObject(),
    registerNumber: student.regNo || "",
    department: student.degree || "",
    cgpa: Number.parseFloat(student.gpa) || 0,
    skills: student.technicalSkills || [],
    interests: student.interests || [],
    adminGuidance: student.mentorFeedback || student.mentorReview || "",
    mentorGuidance: student.mentorGuidance || []
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

    const profile = {
      name: student.name,
      department: student.degree,
      cgpa: student.gpa,
      skills: student.technicalSkills || [],
      interests: student.interests || []
    };

    const career = recommendCareer(profile);
    const skillGap = findSkillGap(profile, career);
    const recommendations = recommendCareers(profile).slice(0, 2);
    const skillMetrics = buildSkillAnalytics(profile, career);
    const readiness = calculateReadiness(profile, career);
    const learningPaths = generateLearningPath(skillGap).map((path) => ({
      skill: path.skill,
      title: path.resources?.[0]?.title || `${path.skill} Foundations`,
      subtitle: path.resources?.[0]?.platform || "Curated Learning Path",
      lessons: Math.max(8, (path.resources?.length || 1) * 8),
      duration: `${Math.max(4, (path.resources?.length || 1) * 4)}h total`,
      resources: path.resources || []
    }));

    student.careerRecommendation = career;
    student.skillGap = skillGap;
    await student.save();

    return res.json({
      student: mapStudent(student),
      career,
      skillGap,
      recommendations: recommendations.map((item) => ({
        careerName: item.title,
        matchScore: item.matchScore,
        description: item.description,
        requiredSkills: item.requiredSkills
      })),
      analytics: {
        skillMetrics,
        readiness,
        weeklyGoal: {
          completed: Math.max(0, Math.min(3, 3 - Math.min(skillGap.length, 3))),
          total: 3,
          targetText: skillGap.length
            ? `Complete 3 modules in ${skillGap[0]} to improve your ${career} readiness.`
            : "Maintain your momentum by completing 3 advanced learning modules this week."
        }
      },
      learningPaths,
      adminGuidance: student.mentorFeedback || student.mentorReview || "",
      mentorGuidance: student.mentorGuidance || []
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate dashboard insights"
    });
  }
}

module.exports = {
  getDashboard
};
