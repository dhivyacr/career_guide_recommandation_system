const recommendationCatalog = [
  {
    title: "Machine Learning Engineer",
    requiredSkills: ["Python", "ML", "Machine Learning", "Statistics"],
    description: "Build predictive systems and production AI workflows."
  },
  {
    title: "Frontend Developer",
    requiredSkills: ["HTML", "CSS", "React", "JavaScript"],
    description: "Design and build modern user interfaces and client applications."
  },
  {
    title: "Data Analyst",
    requiredSkills: ["SQL", "Python", "Excel", "Data Visualization"],
    description: "Turn raw data into actionable dashboards and business insights."
  },
  {
    title: "Backend Developer",
    requiredSkills: ["Java", "Spring", "APIs", "Databases"],
    description: "Build secure APIs, business logic, and scalable backend systems."
  },
  {
    title: "Software Engineer",
    requiredSkills: ["Problem Solving", "Git", "Testing", "Algorithms"],
    description: "General software engineering path for broad technical growth."
  }
];

function normalize(values = []) {
  return values.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
}

function recommendCareers({ skills = [], interests = [] } = {}) {
  const normalizedSkills = normalize(skills);
  const normalizedInterests = normalize(interests);
  const priority = [];

  if (normalizedSkills.includes("python") && (normalizedSkills.includes("ml") || normalizedSkills.includes("machine learning"))) {
    priority.push("Machine Learning Engineer");
  }

  if (normalizedSkills.includes("html") && normalizedSkills.includes("css") && normalizedSkills.includes("react")) {
    priority.push("Frontend Developer");
  }

  if (normalizedSkills.includes("sql") && normalizedSkills.includes("python")) {
    priority.push("Data Analyst");
  }

  if (normalizedSkills.includes("java") && normalizedSkills.includes("spring")) {
    priority.push("Backend Developer");
  }

  if (!priority.length && normalizedInterests.includes("ai")) {
    priority.push("Machine Learning Engineer");
  }

  const scored = recommendationCatalog
    .map((career) => {
      const normalizedRequired = normalize(career.requiredSkills);
      const matchedSkills = career.requiredSkills.filter((skill) => normalizedSkills.includes(String(skill).toLowerCase()));
      return {
        title: career.title,
        description: career.description,
        matchScore: normalizedRequired.length ? Math.round((matchedSkills.length / normalizedRequired.length) * 100) : 0,
        matchedSkills
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return [...new Set([...priority, ...scored.map((item) => item.title)])]
    .slice(0, 3)
    .map((title) => {
      const match = scored.find((item) => item.title === title);
      const base = recommendationCatalog.find((item) => item.title === title);
      return {
        title,
        description: base ? base.description : "Career path recommendation generated from your profile.",
        matchScore: match ? match.matchScore : 0,
        matchedSkills: match ? match.matchedSkills : []
      };
    });
}

module.exports = {
  recommendCareers
};
