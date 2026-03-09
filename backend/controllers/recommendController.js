const { recommendCareers } = require("../services/recommendationService");

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

module.exports = {
  getRecommendations
};
