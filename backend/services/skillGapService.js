const { careers } = require("../data/careers");

function normalizeSkills(values = []) {
  return values.map((value) => String(value).trim().toLowerCase()).filter(Boolean);
}

const targetSkills = {
  "Data Scientist": ["Python", "Machine Learning", "Statistics"],
  "Software Engineer": ["Java", "System Design", "Algorithms"],
  "Frontend Developer": ["React", "JavaScript", "CSS"],
  "Backend Developer": ["Java", "Spring", "System Design"]
};

function getStudentSkills(profile = {}) {
  const rawSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const rawTechnicalSkills = Array.isArray(profile.technicalSkills) ? profile.technicalSkills : [];
  return normalizeSkills([...rawSkills, ...rawTechnicalSkills]);
}

function skillGap(profile = {}) {
  const career = String(profile.targetCareer || "").trim();
  const required = targetSkills[career] || [];
  const studentSkills = getStudentSkills(profile);

  return required.filter((skill) => !studentSkills.includes(String(skill).trim().toLowerCase()));
}

function analyzeSkillGap(student = {}) {
  const studentSkills = getStudentSkills(student);

  return careers.map((career) => {
    const matched = career.skills.filter((skill) => studentSkills.includes(skill.toLowerCase()));
    const missing = career.skills.filter((skill) => !studentSkills.includes(skill.toLowerCase()));
    const readiness = career.skills.length ? Math.round((matched.length / career.skills.length) * 100) : 0;

    return {
      career: career.title,
      readiness,
      matchedSkills: matched,
      missingSkills: missing
    };
  });
}

module.exports = {
  skillGap,
  analyzeSkillGap
};
