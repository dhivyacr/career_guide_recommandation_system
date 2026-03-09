const Career = require("../models/Career");
const CareerRecommendation = require("../models/CareerRecommendation");

function normalizeArray(values = []) {
  return values.map((value) => String(value).trim().toLowerCase()).filter(Boolean);
}

async function recommendCareer(req, res, next) {
  try {
    const { skills = [], interests = [], education = "" } = req.body;

    const studentSkills = normalizeArray(skills);
    const _studentInterests = normalizeArray(interests);
    const _studentEducation = String(education || "").trim().toLowerCase();

    if (!studentSkills.length) {
      return res.status(400).json({
        message: "skills is required and must be a non-empty array"
      });
    }

    const careers = await Career.find({});

    const recommendations = careers
      .map((career) => {
        const requiredSkills = normalizeArray(career.requiredSkills);
        const matchedSkills = requiredSkills.filter((skill) =>
          studentSkills.some((studentSkill) => studentSkill.includes(skill) || skill.includes(studentSkill))
        );
        const missingSkills = requiredSkills.filter(
          (skill) => !studentSkills.some((studentSkill) => studentSkill.includes(skill) || skill.includes(studentSkill))
        );
        const baseScore = requiredSkills.length ? (matchedSkills.length / requiredSkills.length) * 100 : 0;

        return {
          careerName: career.careerName,
          matchScore: Number(baseScore.toFixed(1)),
          missingSkills,
          salaryRange: career.salaryRange || "N/A",
          demandLevel: career.demandLevel || "medium",
          _matchedCount: matchedSkills.length
        };
      })
      .sort((a, b) => {
        if (b.matchScore === a.matchScore) {
          return b._matchedCount - a._matchedCount;
        }
        return b.matchScore - a.matchScore;
      })
      .slice(0, 5)
      .map(({ careerName, matchScore, missingSkills, salaryRange, demandLevel }) => ({
        careerName,
        matchScore,
        missingSkills,
        salaryRange,
        demandLevel
      }));

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
    const careers = await Career.find({}).sort({ careerName: 1 });
    return res.status(200).json({
      total: careers.length,
      careers
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

    const career = await Career.findOne({
      careerName: new RegExp(`^${String(targetCareer).trim()}$`, "i")
    });

    if (!career) {
      return res.status(404).json({
        message: "Career not found"
      });
    }

    const requiredSkills = normalizeArray(career.requiredSkills);
    const missingSkills = requiredSkills.filter(
      (skill) =>
        !normalizedStudentSkills.some((studentSkill) => studentSkill.includes(skill) || skill.includes(studentSkill))
    );

    return res.status(200).json({
      careerName: career.careerName,
      requiredSkills,
      studentSkills: normalizedStudentSkills,
      missingSkills
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
