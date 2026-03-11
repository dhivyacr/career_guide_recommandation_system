const careerSkills = {
  "Data Scientist": ["Python", "Statistics", "Machine Learning", "Pandas", "SQL"],
  "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "System Design"],
  "Software Engineer": ["Java", "C++", "Data Structures", "Algorithms", "System Design"],
  "General Software Developer": ["Problem Solving", "Git", "APIs", "Debugging", "Testing"]
};

function normalize(values = []) {
  return values.map((value) => String(value).trim().toLowerCase()).filter(Boolean);
}

function getStudentSkills(student = {}) {
  const skills = Array.isArray(student.skills) ? student.skills : [];
  const technicalSkills = Array.isArray(student.technicalSkills) ? student.technicalSkills : [];
  return normalize([...skills, ...technicalSkills]);
}

function findSkillGap(student = {}, career = "") {
  const requiredSkills = careerSkills[career] || [];
  const studentSkills = getStudentSkills(student);

  return requiredSkills.filter((skill) => !studentSkills.includes(String(skill).trim().toLowerCase()));
}

function buildSkillAnalytics(student = {}, career = "") {
  const requiredSkills = careerSkills[career] || [];
  const studentSkills = getStudentSkills(student);

  if (!requiredSkills.length) {
    return [];
  }

  return requiredSkills.slice(0, 4).map((skill) => ({
    skill,
    percentage: studentSkills.includes(String(skill).trim().toLowerCase()) ? 92 : 28
  }));
}

function calculateReadiness(student = {}, career = "") {
  const requiredSkills = careerSkills[career] || [];
  const studentSkills = getStudentSkills(student);

  if (!requiredSkills.length) {
    return 0;
  }

  const matched = requiredSkills.filter((skill) => studentSkills.includes(String(skill).trim().toLowerCase()));
  return Math.round((matched.length / requiredSkills.length) * 100);
}

module.exports = {
  careerSkills,
  findSkillGap,
  buildSkillAnalytics,
  calculateReadiness,
  skillGap: ({ targetCareer, ...student }) => findSkillGap(student, targetCareer)
};
