const careerSeedData = require("../seeds/careerSeedData");
const { canonicalizeSkill, collectSkills } = require("./recommendationService");

const SCORE_COLORS = {
  strong: "#34d399",
  moderate: "#fbbf24",
  gap: "#f97316"
};

const DEFAULT_REQUIRED_SKILL_LEVEL = 100;
const DEFAULT_PRESENT_SKILL_LEVEL = 85;
const DEFAULT_MISSING_SKILL_LEVEL = 30;

const careerSkillMap = careerSeedData.reduce((map, career) => {
  map[career.careerName] = Array.isArray(career.requiredSkills) ? career.requiredSkills : [];
  return map;
}, {});

function clampPercentage(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function normalizeLevelEntries(source, targetMap) {
  if (!source) {
    return;
  }

  if (Array.isArray(source)) {
    source.forEach((entry) => {
      if (!entry) {
        return;
      }

      if (typeof entry === "string") {
        targetMap.set(canonicalizeSkill(entry), DEFAULT_PRESENT_SKILL_LEVEL);
        return;
      }

      const skill = String(entry.skill || entry.name || "").trim();
      if (!skill) {
        return;
      }

      const level = clampPercentage(entry.level ?? entry.score ?? entry.percentage ?? DEFAULT_PRESENT_SKILL_LEVEL);
      targetMap.set(canonicalizeSkill(skill), level);
    });
    return;
  }

  if (typeof source === "object") {
    Object.entries(source).forEach(([skill, level]) => {
      if (!String(skill || "").trim()) {
        return;
      }
      targetMap.set(canonicalizeSkill(skill), clampPercentage(level));
    });
  }
}

function getSkillLevelMap(student = {}) {
  const levelMap = new Map();

  normalizeLevelEntries(student.skillLevels, levelMap);
  normalizeLevelEntries(student.technicalSkillLevels, levelMap);
  normalizeLevelEntries(student.skills, levelMap);
  normalizeLevelEntries(student.technicalSkills, levelMap);

  collectSkills(student).forEach((skill) => {
    const normalized = canonicalizeSkill(skill);
    if (!levelMap.has(normalized)) {
      levelMap.set(normalized, DEFAULT_PRESENT_SKILL_LEVEL);
    }
  });

  return levelMap;
}

function getRequiredSkills(career = "") {
  return careerSkillMap[career] || [];
}

function getStatus(score) {
  if (score >= 80) {
    return { key: "strong", label: "Strong Skill", color: SCORE_COLORS.strong };
  }

  if (score >= 50) {
    return { key: "moderate", label: "Needs Improvement", color: SCORE_COLORS.moderate };
  }

  return { key: "gap", label: "Skill Gap", color: SCORE_COLORS.gap };
}

function createSkillMetric(skill, levelMap) {
  const normalizedSkill = canonicalizeSkill(skill);
  const requiredSkillLevel = DEFAULT_REQUIRED_SKILL_LEVEL;
  const studentSkillLevel = levelMap.has(normalizedSkill)
    ? clampPercentage(levelMap.get(normalizedSkill))
    : DEFAULT_MISSING_SKILL_LEVEL;
  const score = clampPercentage((studentSkillLevel / requiredSkillLevel) * 100);
  const status = getStatus(score);

  return {
    skill,
    score,
    percentage: score,
    studentSkillLevel,
    requiredSkillLevel,
    status: status.label,
    color: status.color,
    category: status.key
  };
}

function buildSkillAnalytics(student = {}, career = "") {
  const requiredSkills = getRequiredSkills(career);
  const levelMap = getSkillLevelMap(student);

  return requiredSkills
    .map((skill) => createSkillMetric(skill, levelMap))
    .sort((left, right) => {
      if (right.score === left.score) {
        return left.skill.localeCompare(right.skill);
      }
      return right.score - left.score;
    });
}

function findSkillGap(student = {}, career = "") {
  return buildSkillAnalytics(student, career)
    .filter((item) => item.score < 80)
    .map((item) => item.skill);
}

function calculateReadiness(student = {}, career = "") {
  const metrics = buildSkillAnalytics(student, career);

  if (!metrics.length) {
    return 0;
  }

  const totalScore = metrics.reduce((sum, item) => sum + item.score, 0);
  return Math.round(totalScore / metrics.length);
}

function analyzeSkillGap(student = {}) {
  const career = String(student.targetCareer || student.career || student.careerGoal || "").trim();
  const metrics = buildSkillAnalytics(student, career);

  return {
    careerName: career,
    skillMetrics: metrics,
    missingSkills: metrics.filter((item) => item.score < 80).map((item) => item.skill),
    readiness: calculateReadiness(student, career)
  };
}

module.exports = {
  analyzeSkillGap,
  careerSkills: careerSkillMap,
  findSkillGap,
  buildSkillAnalytics,
  calculateReadiness,
  skillGap: ({ targetCareer, ...student }) => findSkillGap(student, targetCareer)
};
