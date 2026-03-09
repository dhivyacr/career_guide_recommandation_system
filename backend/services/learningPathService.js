const { learningResources } = require("../data/learningResources");

function generateLearningPath(missingSkills = []) {
  return missingSkills.map((skill) => {
    const normalized = String(skill || "").trim().toLowerCase();
    const key = Object.keys(learningResources).find((resourceKey) => resourceKey.toLowerCase() === normalized);

    return {
      skill,
      resources: key ? learningResources[key] : []
    };
  });
}

module.exports = {
  generateLearningPath
};
