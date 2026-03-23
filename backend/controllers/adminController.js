const User = require("../models/User");
const CareerRecommendation = require("../models/CareerRecommendation");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const { recommendCareer, recommendCareers } = require("../services/recommendationService");
const { generateLearningPath } = require("../services/learningPathService");

function mapStudentRecord(student) {
  return {
    ...student.toObject(),
    registerNumber: student.regNo || "",
    department: student.degree || "",
    cgpa: Number.parseFloat(student.gpa) || 0,
    mentorName: student.mentorName || student.mentorId?.name || "Unassigned",
    mentor: student.mentorId
      ? {
          id: student.mentorId._id || student.mentorId,
          name: student.mentorId.name || "",
          email: student.mentorId.email || ""
        }
      : null,
    lastUpdated: student.updatedAt || student.createdAt || null,
    adminGuidance: student.mentorReview || "",
    mentorGuidance: student.mentorGuidance || []
  };
}

function buildStudentScope(req) {
  return ["admin", "faculty", "mentor"].includes(req.user?.role) && req.user?.role !== "admin"
    ? { mentorId: req.user.mentorId || req.user.id }
    : {};
}

function dedupeStudents(students = []) {
  return Array.from(
    new Map(
      students.map((student) => [
        student.userId?.toString() || student.regNo || student.email || student._id.toString(),
        student
      ])
    ).values()
  );
}

function buildStudentSummary(students = []) {
  const departmentStats = {};

  students.forEach((student) => {
    const department = student.degree || student.department || "Unassigned";
    departmentStats[department] = (departmentStats[department] || 0) + 1;
  });

  const totalStudents = students.length;
  const averageCGPA = totalStudents
    ? students.reduce((sum, student) => sum + (Number.parseFloat(student.gpa) || 0), 0) / totalStudents
    : 0;

  return {
    totalStudents,
    averageCGPA,
    departmentStats
  };
}

async function getAnalytics(req, res, next) {
  try {
    const [totalUsers, totalStudents, totalMentors, recentUsers, recommendationAgg] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      Mentor.countDocuments(),
      User.find({})
        .select("name email role createdAt")
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
      totalMentors,
      completedProfiles: await Student.countDocuments({ profileCompleted: true }),
      mostRecommendedCareer: recommendationAgg[0]?._id || "N/A",
      recentUsers: recentUsers.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        status: user.role === "student" ? "Active" : "Staff"
      }))
    });
  } catch (error) {
    return next(error);
  }
}

async function getDashboard(req, res, next) {
  try {
    const [totalStudents, mentors] = await Promise.all([
      Student.countDocuments(),
      Mentor.find({})
        .select("name email studentsAssigned students")
        .sort({ createdAt: 1 })
    ]);

    return res.status(200).json({
      totalStudents,
      totalMentors: mentors.length,
      mentorDistribution: mentors.map((mentor) => ({
        mentor: mentor.name,
        email: mentor.email,
        students: mentor.studentsAssigned ?? mentor.students?.length ?? 0
      }))
    });
  } catch (error) {
    return next(error);
  }
}

async function getStudentPerformance(req, res, next) {
  try {
    const students = await Student.find({})
      .populate("mentorId", "name email")
      .select("name email performanceScore mentorId");

    return res.status(200).json({
      students: students.map((student) => ({
        name: student.name,
        email: student.email,
        mentorName: student.mentorName || student.mentorId?.name || "Unassigned",
        mentor: student.mentorId?.name || "Unassigned",
        score: student.performanceScore || 0
      }))
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAnalytics,
  getDashboard,
  getStudentPerformance,
  async clearStudents(req, res, next) {
    try {
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({
          message: "Student cleanup is disabled in production"
        });
      }

      if (req.user?.role !== "admin") {
        return res.status(403).json({
          message: "Only admins can clear student records"
        });
      }

      await Student.deleteMany({});
      await Mentor.updateMany({}, { $set: { students: [], studentsAssigned: 0 } });

      return res.status(200).json({
        message: "All student records deleted successfully"
      });
    } catch (error) {
      return next(error);
    }
  },
  async getStudents(req, res, next) {
    try {
      const students = await Student.find(buildStudentScope(req))
        .populate("mentorId", "name email")
        .select("userId name email regNo degree gpa technicalSkills interests mentorId mentorName createdAt updatedAt")
        .sort({ updatedAt: -1, createdAt: -1 });

      const dedupedStudents = dedupeStudents(students).map(mapStudentRecord);
      const summary = buildStudentSummary(dedupedStudents);

      return res.status(200).json({
        totalStudents: summary.totalStudents,
        avgCGPA: summary.averageCGPA,
        averageCGPA: summary.averageCGPA,
        departmentStats: summary.departmentStats,
        students: dedupedStudents
      });
    } catch (error) {
      return next(error);
    }
  },
  async getAllStudents(req, res, next) {
    try {
      const students = await Student.find(buildStudentScope(req))
        .populate("mentorId", "name email")
        .select("userId name email regNo degree gpa technicalSkills interests mentorId mentorName createdAt updatedAt")
        .sort({ updatedAt: -1, createdAt: -1 });

      const dedupedStudents = dedupeStudents(students).map(mapStudentRecord);
      const summary = buildStudentSummary(dedupedStudents);

      return res.status(200).json({
        total: dedupedStudents.length,
        totalStudents: summary.totalStudents,
        avgCGPA: summary.averageCGPA,
        averageCGPA: summary.averageCGPA,
        departmentStats: summary.departmentStats,
        students: dedupedStudents
      });
    } catch (error) {
      return next(error);
    }
  },
  async getStudentById(req, res, next) {
    try {
      const { id } = req.params;
      const student = await Student.findOne({ _id: id, ...buildStudentScope(req) });

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

      const recommendations = await recommendCareers(profile, { limit: 5 });
      const bestMatch = recommendations[0] || null;
      const career = bestMatch?.careerName || (await recommendCareer(profile));
      const missingSkills = bestMatch?.missingSkills || [];
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

      const student = await Student.findOneAndUpdate(
        { _id: id, ...buildStudentScope(req) },
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
  },
  async addGuidanceEntry(req, res, next) {
    try {
      const { studentId } = req.params;
      const message = String(req.body?.message || "").trim();

      if (!message) {
        return res.status(400).json({ message: "Guidance message is required" });
      }

      const student = await Student.findOne({ _id: studentId, ...buildStudentScope(req) });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      student.mentorGuidance = student.mentorGuidance || [];
      student.mentorGuidance.push({
        message,
        date: new Date()
      });
      student.mentorReview = message;
      student.updatedAt = new Date();

      await student.save();

      return res.status(200).json({
        message: "Guidance added successfully",
        student: mapStudentRecord(student)
      });
    } catch (error) {
      return next(error);
    }
  },
  async updateAdminGuidance(req, res, next) {
    try {
      const registerNumber = String(req.params?.registerNumber || "")
        .trim()
        .toUpperCase();
      const adminGuidance = String(req.body?.adminGuidance || "").trim();

      if (!adminGuidance) {
        return res.status(400).json({ message: "Guidance message is required" });
      }

      const student = await Student.findOne({ regNo: registerNumber, ...buildStudentScope(req) });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      student.mentorReview = adminGuidance;
      student.mentorGuidance = student.mentorGuidance || [];
      student.mentorGuidance.push({
        message: adminGuidance,
        date: new Date()
      });
      student.updatedAt = new Date();

      await student.save();

      return res.status(200).json({
        message: "Guidance saved successfully",
        student: mapStudentRecord(student)
      });
    } catch (error) {
      return next(error);
    }
  },
  async getMentors(req, res, next) {
    try {
      const mentors = await Mentor.find({})
        .select("name email")
        .sort({ name: 1 });

      return res.status(200).json({
        mentors: mentors.map((mentor) => ({
          _id: mentor._id,
          name: mentor.name || "",
          email: mentor.email || ""
        }))
      });
    } catch (error) {
      return next(error);
    }
  },
  async assignMentor(req, res, next) {
    try {
      const { id } = req.params;
      const { mentorId = "" } = req.body;

      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const previousMentorId = student.mentorId ? String(student.mentorId) : "";

      if (mentorId) {
        const mentor = await Mentor.findById(mentorId);

        if (!mentor) {
          return res.status(404).json({ message: "Mentor not found" });
        }

        if (previousMentorId && previousMentorId !== String(mentor._id)) {
          await Mentor.findByIdAndUpdate(previousMentorId, {
            $pull: { students: student._id },
            $inc: { studentsAssigned: -1 }
          });
        }

        if (previousMentorId !== String(mentor._id)) {
          await Mentor.findByIdAndUpdate(mentor._id, {
            $addToSet: { students: student._id },
            $inc: { studentsAssigned: 1 }
          });
        }

        student.mentorId = mentor._id;
        student.mentorName = mentor.name || "Unassigned";
      } else {
        if (previousMentorId) {
          await Mentor.findByIdAndUpdate(previousMentorId, {
            $pull: { students: student._id },
            $inc: { studentsAssigned: -1 }
          });
        }

        student.mentorId = null;
        student.mentorName = "Unassigned";
      }

      await student.save();
      await student.populate("mentorId", "name email");

      return res.status(200).json({
        message: "Mentor updated successfully",
        student: mapStudentRecord(student)
      });
    } catch (error) {
      return next(error);
    }
  }
};
