const { buildCareerRecommendations } = require("../../services/recommendation/recommendationEngine");

async function recommendCareer(req, res, next) {
  try {
    const { skills, interests } = req.body;

    const profile = {
      skills: Array.isArray(skills) ? skills : req.user.skills || [],
      interests: Array.isArray(interests) ? interests : req.user.interests || []
    };

    const recommendations = buildCareerRecommendations(profile);

    return res.status(200).json({
      profile,
      totalRecommendations: recommendations.length,
      recommendations
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  recommendCareer
};
