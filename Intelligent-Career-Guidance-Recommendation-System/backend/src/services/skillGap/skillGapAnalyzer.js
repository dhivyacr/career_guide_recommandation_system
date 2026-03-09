const { CAREER_RULES } = require("../recommendation/recommendationEngine");

function normalizeArray(values = []) {
  return values.map((v) => String(v).trim().toLowerCase()).filter(Boolean);
}

function titleCase(value = "") {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function buildLearningResources(skill) {
  const encoded = encodeURIComponent(skill);
  return [
    {
      title: `${titleCase(skill)} - Coursera`,
      url: `https://www.coursera.org/search?query=${encoded}`
    },
    {
      title: `${titleCase(skill)} - Udemy`,
      url: `https://www.udemy.com/courses/search/?q=${encoded}`
    },
    {
      title: `${titleCase(skill)} - YouTube Tutorials`,
      url: `https://www.youtube.com/results?search_query=${encoded}`
    }
  ];
}

function analyzeSkillGap({ studentSkills = [], careerName, careerRequiredSkills = [] }) {
  const normalizedStudentSkills = normalizeArray(studentSkills);

  let requiredSkills = normalizeArray(careerRequiredSkills);
  if (!requiredSkills.length && careerName) {
    const matchedCareer = CAREER_RULES.find(
      (career) => career.careerName.toLowerCase() === String(careerName).trim().toLowerCase()
    );
    requiredSkills = matchedCareer ? normalizeArray(matchedCareer.skills) : [];
  }

  const missingSkills = requiredSkills.filter((skill) => !normalizedStudentSkills.includes(skill));

  const suggestedLearningResources = missingSkills.map((skill) => ({
    skill,
    resources: buildLearningResources(skill)
  }));

  return {
    careerName: careerName || null,
    studentSkills: normalizedStudentSkills,
    requiredSkills,
    missingSkills,
    suggestedLearningResources
  };
}

module.exports = {
  analyzeSkillGap
};
