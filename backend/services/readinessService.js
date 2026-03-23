function calculateProfileCompletion(student = {}) {
  const fields = [
    Boolean(String(student.name || "").trim()),
    Boolean(String(student.email || "").trim()),
    Boolean(String(student.degree || student.department || "").trim()),
    Boolean(String(student.year || "").trim()),
    Array.isArray(student.technicalSkills || student.skills) && (student.technicalSkills || student.skills || []).length > 0,
    Boolean(String(student.careerGoal || "").trim())
  ];

  const completedFields = fields.filter(Boolean).length;
  return Math.round((completedFields / fields.length) * 100);
}

function buildNextRecommendation(topCareerMatch = "") {
  const normalizedCareer = String(topCareerMatch || "").trim();

  if (!normalizedCareer) {
    return "Build 2 practical projects aligned with your best-fit role";
  }

  if (/developer/i.test(normalizedCareer)) {
    const focus = normalizedCareer.replace(/developer/i, "").trim().toLowerCase();
    return `Build 2 ${focus || "software"} projects`;
  }

  if (/designer/i.test(normalizedCareer)) {
    return `Create 2 portfolio-ready design case studies for ${normalizedCareer}`;
  }

  return `Build 2 portfolio projects aligned with ${normalizedCareer}`;
}

function buildReadinessReport({ student = {}, bestMatch = null, weeklyGoal = null, career = "", skillGap = [] } = {}) {
  const skillMatch = Math.round(Number(bestMatch?.matchPercentage ?? bestMatch?.matchScore ?? 0));
  const goalCompletion = Math.round(Number(weeklyGoal?.progress ?? 0));
  const profileCompletion = calculateProfileCompletion(student);
  const readinessScore = Math.round(
    skillMatch * 0.5 +
      goalCompletion * 0.3 +
      profileCompletion * 0.2
  );

  const topCareerMatch = career || bestMatch?.careerName || "";
  const strengths = (bestMatch?.matchedSkills || []).slice(0, 3);
  const nextRecommendation = buildNextRecommendation(topCareerMatch);

  return {
    readinessScore,
    skillMatch,
    goalCompletion,
    profileCompletion,
    topCareerMatch,
    bestCareerMatchLabel: topCareerMatch ? `${topCareerMatch} (${skillMatch}%)` : "",
    strengths,
    skillGap,
    weeklyGoals: weeklyGoal?.goals || []
      .slice(0, 3)
      .map((goal) => ({
        _id: goal._id,
        goalTitle: goal.goalTitle,
        skill: goal.skill,
        completed: goal.completed
      })),
    nextRecommendation
  };
}

module.exports = {
  buildReadinessReport,
  calculateProfileCompletion
};
