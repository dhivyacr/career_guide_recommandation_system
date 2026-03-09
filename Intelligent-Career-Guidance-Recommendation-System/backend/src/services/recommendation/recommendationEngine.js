function normalizeArray(values = []) {
  return values.map((v) => String(v).trim().toLowerCase()).filter(Boolean);
}

const CAREER_RULES = [
  {
    careerName: "Software Engineer",
    skills: ["javascript", "java", "python", "node.js", "react", "algorithms", "data structures", "git"],
    interests: ["coding", "software development", "problem solving", "web development"]
  },
  {
    careerName: "Data Scientist",
    skills: ["python", "statistics", "machine learning", "sql", "data analysis", "pandas", "numpy"],
    interests: ["data", "analytics", "research", "ai"]
  },
  {
    careerName: "AI Engineer",
    skills: ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "nlp"],
    interests: ["artificial intelligence", "ai", "automation", "research"]
  },
  {
    careerName: "Cybersecurity Analyst",
    skills: ["network security", "ethical hacking", "incident response", "siem", "risk assessment", "linux"],
    interests: ["security", "cybersecurity", "forensics", "threat analysis"]
  },
  {
    careerName: "UI/UX Designer",
    skills: ["figma", "wireframing", "prototyping", "user research", "ui design", "ux design", "visual design"],
    interests: ["design", "creativity", "user experience", "product design"]
  },
  {
    careerName: "Business Analyst",
    skills: ["sql", "excel", "communication", "requirements gathering", "data analysis", "stakeholder management"],
    interests: ["business", "strategy", "analytics", "problem solving"]
  }
];

function buildCareerRecommendations(studentProfile) {
  const studentSkills = normalizeArray(studentProfile.skills);
  const studentInterests = normalizeArray(studentProfile.interests);

  const scored = CAREER_RULES.map((rule) => {
    const requiredSkills = normalizeArray(rule.skills);
    const relatedInterests = normalizeArray(rule.interests);

    const matchedSkills = requiredSkills.filter((skill) => studentSkills.includes(skill));
    const matchedInterests = relatedInterests.filter((interest) => studentInterests.includes(interest));
    const missingSkills = requiredSkills.filter((skill) => !studentSkills.includes(skill));
    const score = matchedSkills.length * 2 + matchedInterests.length;

    return {
      careerName: rule.careerName,
      score,
      matchedSkills,
      matchedInterests,
      missingSkills
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

module.exports = {
  buildCareerRecommendations,
  CAREER_RULES
};
