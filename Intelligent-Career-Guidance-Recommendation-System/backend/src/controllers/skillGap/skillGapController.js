const { analyzeSkillGap } = require("../../services/skillGap/skillGapAnalyzer");

async function getSkillGapAnalysis(req, res, next) {
  try {
    const { studentSkills, careerName, careerRequiredSkills } = req.body;

    const inputStudentSkills = Array.isArray(studentSkills) ? studentSkills : req.user.skills || [];

    if (!careerName && (!Array.isArray(careerRequiredSkills) || !careerRequiredSkills.length)) {
      return res.status(400).json({
        message: "Provide either careerName or careerRequiredSkills"
      });
    }

    const analysis = analyzeSkillGap({
      studentSkills: inputStudentSkills,
      careerName,
      careerRequiredSkills
    });

    if (!analysis.requiredSkills.length) {
      return res.status(404).json({
        message: "Career not found or required skills not available"
      });
    }

    return res.status(200).json({
      careerName: analysis.careerName,
      missingSkills: analysis.missingSkills,
      suggestedLearningResources: analysis.suggestedLearningResources
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSkillGapAnalysis
};
