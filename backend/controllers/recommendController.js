const Student = require("../models/Student");
const { recommendCareer, recommendCareers } = require("../services/recommendationService");

const getRecommendations = async (req, res) => {
  const student = req.body || {};
  const results = await recommendCareers(student, { limit: 5 });
  return res.json(results);
};

async function getCareerByRegisterNumber(req, res) {
  try {
    const registerNumber = String(req.params?.registerNumber || "")
      .trim()
      .toUpperCase();

    if (!registerNumber) {
      return res.status(400).json({
        message: "registerNumber is required"
      });
    }

    const student = await Student.findOne({ regNo: registerNumber });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const normalizedStudent = {
      name: student.name,
      skills: student.technicalSkills || [],
      interests: student.interests || [],
      department: student.degree || "",
      cgpa: Number.parseFloat(student.gpa) || 0
    };

    const recommendations = await recommendCareers(normalizedStudent, { limit: 5 });
    const bestMatch = recommendations[0] || null;
    const career = bestMatch?.careerName || (await recommendCareer(normalizedStudent));
    const skillGap = bestMatch?.missingSkills || [];

    student.careerRecommendation = career;
    student.careerPath = student.careerGoal || career;
    student.skillGap = skillGap;
    await student.save();

    return res.json({
      careerRecommendation: career,
      bestMatch,
      skillGap,
      student: {
        name: student.name,
        registerNumber: student.regNo,
        department: student.degree || "",
        cgpa: Number.parseFloat(student.gpa) || 0,
        skills: student.technicalSkills || [],
        interests: student.interests || []
      },
      recommendations
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error"
    });
  }
}

module.exports = {
  getRecommendations,
  getCareerByRegisterNumber
};
