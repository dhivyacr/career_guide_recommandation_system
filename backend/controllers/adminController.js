const User = require("../models/User");
const CareerRecommendation = require("../models/CareerRecommendation");
const Student = require("../models/Student");
const { recommendCareer } = require("../services/recommendationService");
const { skillGap } = require("../services/skillGapService");
const { generateLearningPath } = require("../services/learningPathService");

async function getAnalytics(req, res, next) {
  try {
    const [totalUsers, totalStudents, completedProfiles, recentUsers, recommendationAgg] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      User.countDocuments({
        education: { $ne: "" },
        skills: { $exists: true, $not: { $size: 0 } },
        interests: { $exists: true, $not: { $size: 0 } }
      }),
      User.find({})
        .select("name email role createdAt education skills interests")
        .sort({ createdAt: -1 })
        .limit(10),
      CareerRecommendation.aggregate([
        { $group: { _id: "$careerName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ])
    ]);

    return res.status(200).json({
      totalUsers,
      totalStudents,
      completedProfiles,
      mostRecommendedCareer: recommendationAgg[0]?._id || "N/A",
      recentUsers: recentUsers.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        status: user.education && user.skills?.length ? "Active" : "Pending"
      }))
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAnalytics,
  async getStudents(req, res, next) {
    try {
      const students = await Student.find({})
        .select("name regNo degree gpa createdAt")
        .sort({ createdAt: -1 });

      return res.status(200).json(students);
    } catch (error) {
      return next(error);
    }
  },
  async getAllStudents(req, res, next) {
    try {
      const students = await Student.find({})
        .select("name regNo degree gpa createdAt")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        total: students.length,
        students
      });
    } catch (error) {
      return next(error);
    }
  },
  async getStudentById(req, res, next) {
    try {
      const { id } = req.params;
      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const profile = {
        name: student.name,
        degree: student.degree,
        gpa: student.gpa,
        technicalSkills: student.technicalSkills || [],
        skills: student.technicalSkills || [],
        softSkills: student.softSkills || [],
        interests: student.interests || [],
        careerGoal: student.careerGoal || ""
      };

      const career = recommendCareer(profile);
      const missingSkills = skillGap({ ...profile, targetCareer: career });
      const learningPath = generateLearningPath(missingSkills);

      return res.status(200).json({
        student,
        careerRecommendation: career,
        skillGap: missingSkills,
        learningPath
      });
    } catch (error) {
      return next(error);
    }
  },
  async addMentorNote(req, res, next) {
    try {
      const { id } = req.params;
      const { note = "" } = req.body;

      const student = await Student.findByIdAndUpdate(
        id,
        { mentorReview: String(note || "").trim() },
        { new: true }
      );

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      return res.status(200).json({
        message: "Mentor review saved",
        student
      });
    } catch (error) {
      return next(error);
    }
  }
};
