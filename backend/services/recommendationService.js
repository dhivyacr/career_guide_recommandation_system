const { careers } = require("../data/careers");

function normalizeSkills(values = []) {
  return values.map((value) => String(value).trim().toLowerCase()).filter(Boolean);
}

function getStudentSkills(profile = {}) {
  const rawSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const rawTechnicalSkills = Array.isArray(profile.technicalSkills) ? profile.technicalSkills : [];
  return normalizeSkills([...rawSkills, ...rawTechnicalSkills]);
}

function recommendCareer(profile = {}) {
  const normalizedSkillsArray = getStudentSkills(profile);
  const skillsFromString = String(profile.skills || "")
    .toLowerCase()
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const skills = [...normalizedSkillsArray, ...skillsFromString].join(" ").toLowerCase();

  if (
    skills.includes("react") ||
    skills.includes("html") ||
    skills.includes("css") ||
    skills.includes("javascript") ||
    skills.includes("tailwind")
  ) {
    return "Frontend Developer";
  }

  if (skills.includes("python") || skills.includes("machine learning") || skills.includes("data")) {
    return "Data Scientist";
  }

  if (skills.includes("java") || skills.includes("spring") || skills.includes("system design")) {
    return "Backend Developer";
  }

  return "Software Engineer";
}

function recommendCareers(student = {}) {
  const studentSkills = getStudentSkills(student);

  return careers
    .map((career) => {
      const careerSkillsNormalized = normalizeSkills(career.skills);
      const matches = career.skills.filter((skill) => studentSkills.includes(skill.toLowerCase()));
      const score = careerSkillsNormalized.length
        ? Math.round((matches.length / careerSkillsNormalized.length) * 100)
        : 0;

      return {
        title: career.title,
        matchScore: score,
        matchedSkills: matches,
        requiredSkills: career.skills
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = {
  recommendCareer,
  recommendCareers
};
