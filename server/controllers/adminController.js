const Student = require("../models/Student");
const Mentor = require("../models/Mentor");

exports.getDashboard = async (req, res) => {
  try {
    const [totalStudents, totalMentors, mentors] = await Promise.all([
      Student.countDocuments(),
      Mentor.countDocuments(),
      Mentor.find({}).sort({ createdAt: 1 })
    ]);

    return res.json({
      totalStudents,
      totalMentors,
      mentorDistribution: mentors.map((mentor) => ({
        mentor: mentor.name,
        students: mentor.studentsAssigned
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentPerformance = async (req, res) => {
  try {
    const students = await Student.find({}).populate("mentorId", "name").sort({ performanceScore: -1 });

    return res.json({
      students: students.map((student) => ({
        name: student.name,
        mentor: student.mentorId?.name || "Unassigned",
        score: student.performanceScore || 0
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({}).sort({ updatedAt: -1, createdAt: -1 });

    const totalStudents = students.length;
    const totalCgpa = students.reduce((sum, student) => sum + (Number(student.cgpa) || 0), 0);
    const avgCGPA = totalStudents ? Number((totalCgpa / totalStudents).toFixed(2)) : 0;
    const departmentStats = students.reduce((stats, student) => {
      const department = student.department || "Unassigned";
      stats[department] = (stats[department] || 0) + 1;
      return stats;
    }, {});

    return res.json({
      totalStudents,
      avgCGPA,
      departmentStats,
      students: students.map((student) => ({
        _id: student._id,
        userId: student.userId,
        name: student.name,
        email: student.email,
        registerNumber: student.registerNumber,
        department: student.department,
        cgpa: student.cgpa,
        skills: student.skills,
        interests: student.interests,
        recommendation: student.careerRecommendation,
        careerRecommendation: student.careerRecommendation,
        skillGap: student.skillGap,
        mentorFeedback: student.mentorFeedback,
        adminGuidance: student.adminGuidance,
        mentorGuidance: student.mentorGuidance,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        lastUpdated: student.updatedAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentByRegisterNumber = async (req, res) => {
  try {
    const registerNumber = String(req.params.registerNumber || "").trim();
    const student = await Student.findOne({ registerNumber });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({
      student: {
        ...student.toObject(),
        recommendation: student.careerRecommendation
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.addGuidance = async (req, res) => {
  try {
    const studentId = String(req.params.studentId || "").trim();
    const message = String(req.body?.message || req.body?.adminGuidance || "").trim();

    if (!message) {
      return res.status(400).json({ message: "Guidance message is required" });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        $set: { adminGuidance: message },
        $push: { mentorGuidance: { message, date: new Date() } }
      },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({ message: "Guidance saved successfully", student });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
