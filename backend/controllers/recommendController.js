const Student = require("../models/Student");
const { recommendCareer, recommendCareers } = require("../services/recommendationService");
const { findSkillGap } = require("../services/skillGapService");

const getRecommendations = (req, res) => {
  const student = req.body || {};
  const results = recommendCareers(student);
  const sortedResults = [...results].sort((a, b) => {
    const scoreA = Number(a.score ?? a.matchScore ?? 0);
    const scoreB = Number(b.score ?? b.matchScore ?? 0);
    return scoreB - scoreA;
  });

  return res.json(sortedResults);
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

    const career = recommendCareer(normalizedStudent);
    const skillGap = findSkillGap(normalizedStudent, career);

    student.careerRecommendation = career;
    student.skillGap = skillGap;
    await student.save();

    return res.json({
      careerRecommendation: career,
      skillGap,
      student: {
        name: student.name,
        registerNumber: student.regNo,
        department: student.degree || "",
        cgpa: Number.parseFloat(student.gpa) || 0,
        skills: student.technicalSkills || [],
        interests: student.interests || []
      },
      recommendations: recommendCareers(normalizedStudent).slice(0, 2).map((item) => ({
        careerName: item.title,
        matchScore: item.matchScore,
        description: item.description,
        requiredSkills: item.requiredSkills
      }))
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
