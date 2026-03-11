const careerProfiles = {
  "Machine Learning Engineer": {
    skills: ["Python", "ML", "Statistics", "TensorFlow"],
    description: "Strong fit for students building models and intelligent systems."
  },
  "Frontend Developer": {
    skills: ["HTML", "CSS", "React", "JavaScript"],
    description: "Best suited for students focused on user interfaces and web experiences."
  },
  "Data Analyst": {
    skills: ["SQL", "Python", "Excel", "Data Visualization"],
    description: "Ideal for students interested in analytics, reporting, and decision support."
  },
  "Software Engineer": {
    skills: ["Java", "Python", "Data Structures", "Algorithms"],
    description: "Broad engineering path for students interested in scalable software systems."
  }
};

function normalize(values = []) {
  return values.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
}

function collectSkills(student = {}) {
  const directSkills = Array.isArray(student.skills) ? student.skills : [];
  const technicalSkills = Array.isArray(student.technicalSkills) ? student.technicalSkills : [];
  return normalize([...directSkills, ...technicalSkills]);
}

function collectInterests(student = {}) {
  return normalize(Array.isArray(student.interests) ? student.interests : []);
}

function recommendCareer(student = {}) {
  const skills = collectSkills(student);
  const interests = collectInterests(student);

  if (skills.includes("python") && (skills.includes("ml") || skills.includes("machine learning"))) {
    return "Machine Learning Engineer";
  }

  if (skills.includes("html") && skills.includes("css") && (skills.includes("react") || skills.includes("javascript"))) {
    return "Frontend Developer";
  }

  if (skills.includes("sql") && skills.includes("python")) {
    return "Data Analyst";
  }

  if (skills.includes("python") && interests.includes("ai")) {
    return "Machine Learning Engineer";
  }

  return "Software Engineer";
}

function recommendCareers(student = {}) {
  const studentSkills = collectSkills(student);

  return Object.entries(careerProfiles)
    .map(([title, profile]) => {
      const normalizedRequired = normalize(profile.skills);
      const matchedSkills = profile.skills.filter((skill) =>
        studentSkills.includes(String(skill).trim().toLowerCase())
      );
      const missingSkills = profile.skills.filter((skill) =>
        !studentSkills.includes(String(skill).trim().toLowerCase())
      );

      return {
        title,
        description: profile.description,
        matchScore: normalizedRequired.length ? Math.round((matchedSkills.length / normalizedRequired.length) * 100) : 0,
        matchedSkills,
        missingSkills,
        requiredSkills: profile.skills
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = {
  careerProfiles,
  recommendCareer,
  recommendCareers
};
