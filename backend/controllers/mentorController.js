const Student = require("../models/Student");

async function getMentorDashboard(req, res, next) {
  try {
    const totalStudents = await Student.countDocuments();

    return res.status(200).json({
      mentor: req.user.name,
      email: req.user.email,
      studentsAssigned: totalStudents,
      totalStudents
    });
  } catch (error) {
    return next(error);
  }
}

async function getAssignedStudents(req, res, next) {
  try {
    const students = await Student.find({})
      .select("name email regNo degree gpa technicalSkills interests careerPath careerGoal skillGap mentorFeedback mentorReview updatedAt")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      students: students.map((student) => ({
        _id: student._id,
        name: student.name || "",
        email: student.email || "",
        registerNumber: student.regNo || "",
        department: student.degree || "",
        cgpa: Number(student.gpa || 0),
        skills: student.technicalSkills || [],
        interests: student.interests || [],
        careerPath: student.careerPath || student.careerGoal || "",
        skillGap: student.skillGap || [],
        mentorFeedback: student.mentorFeedback || student.mentorReview || "",
        updatedAt: student.updatedAt
      }))
    });
  } catch (error) {
    return next(error);
  }
}

async function giveFeedback(req, res, next) {
  try {
    const { studentId, feedback } = req.body;

    if (!studentId || !feedback) {
      return res.status(400).json({ message: "studentId and feedback are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.mentorGuidance = student.mentorGuidance || [];
    student.mentorGuidance.push({
      message: String(feedback).trim(),
      date: new Date()
    });
    student.mentorFeedback = String(feedback).trim();
    student.mentorReview = String(feedback).trim();
    await student.save();

    return res.json(student);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMentorDashboard,
  getAssignedStudents,
  giveFeedback
};
