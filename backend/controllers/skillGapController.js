const { analyzeSkillGap } = require("../services/skillGapService");

const getSkillGap = (req, res) => {
  const student = req.body || {};
  const result = analyzeSkillGap(student);
  return res.json(result);
};

module.exports = {
  getSkillGap
};
