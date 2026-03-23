const CareerRecommendation = require("../models/CareerRecommendation");
const { getCareerCatalog, getCareerMatch, recommendCareers } = require("../services/recommendationService");

function normalizeArray(values = []) {
  return values.map((value) => String(value).trim().toLowerCase()).filter(Boolean);
}

async function recommendCareer(req, res, next) {
  try {
    const { skills = [], interests = [], education = "" } = req.body;

    const studentSkills = normalizeArray(skills);
    if (!studentSkills.length) {
      return res.status(400).json({
        message: "skills is required and must be a non-empty array"
      });
    }

    const recommendations = await recommendCareers(
      {
        skills,
        technicalSkills: skills,
        interests,
        education
      },
      { limit: 5 }
    );

    if (recommendations.length) {
      await CareerRecommendation.insertMany(
        recommendations.map((item) => ({
          careerName: item.careerName,
          matchScore: item.matchScore,
          education: String(education || "").trim(),
          interests: normalizeArray(interests)
        }))
      );
    }

    return res.status(200).json({
      recommendations
    });
  } catch (error) {
    return next(error);
  }
}

async function listCareers(req, res, next) {
  try {
    const careers = await getCareerCatalog();
    return res.status(200).json({
      total: careers.length,
      careers: careers.sort((left, right) => left.careerName.localeCompare(right.careerName))
    });
  } catch (error) {
    return next(error);
  }
}

async function skillGapAnalysis(req, res, next) {
  try {
    const { targetCareer = "", studentSkills = [] } = req.body;
    const normalizedStudentSkills = normalizeArray(studentSkills);

    if (!normalizedStudentSkills.length) {
      return res.status(400).json({
        message: "studentSkills is required and must be a non-empty array"
      });
    }

    if (!targetCareer) {
      return res.status(400).json({
        message: "targetCareer is required"
      });
    }

    const career = await getCareerMatch({ skills: studentSkills, technicalSkills: studentSkills }, targetCareer);

    if (!career) {
      return res.status(404).json({
        message: "Career not found"
      });
    }

    return res.status(200).json({
      careerName: career.careerName,
      requiredSkills: career.requiredSkills,
      studentSkills: normalizedStudentSkills,
      missingSkills: career.missingSkills
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  recommendCareer,
  listCareers,
  skillGapAnalysis
};
