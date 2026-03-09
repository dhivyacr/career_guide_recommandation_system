const { recommendCareer } = require("../services/recommendationService");
const { skillGap } = require("../services/skillGapService");

const getDashboard = async (req, res) => {
  try {
    const profile = req.body || {};
    const normalizedSkills = Array.isArray(profile.skills)
      ? profile.skills
      : String(profile.skills || "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
    const normalizedTechnicalSkills = Array.isArray(profile.technicalSkills)
      ? profile.technicalSkills
      : String(profile.technicalSkills || "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

    const normalizedProfile = {
      ...profile,
      skills: normalizedSkills,
      technicalSkills: normalizedTechnicalSkills
    };

    const career = recommendCareer(normalizedProfile);
    const gap = skillGap({
      ...normalizedProfile,
      targetCareer: career
    });

    return res.json({
      career,
      skillGap: gap
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate dashboard insights"
    });
  }
};

module.exports = {
  getDashboard
};
