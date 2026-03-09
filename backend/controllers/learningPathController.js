const { generateLearningPath } = require("../services/learningPathService");

const getLearningPath = (req, res) => {
  const { missingSkills = [] } = req.body || {};
  const result = generateLearningPath(missingSkills);
  return res.json(result);
};

module.exports = {
  getLearningPath
};
