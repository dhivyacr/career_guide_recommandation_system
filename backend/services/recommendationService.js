const Career = require("../models/Career");
const careerSeedData = require("../seeds/careerSeedData");

const SKILL_ALIASES = {
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  node: "node.js",
  nodejs: "node.js",
  "node.js": "node.js",
  reactjs: "react",
  vuejs: "vue.js",
  angularjs: "angular",
  ml: "machine learning",
  ai: "artificial intelligence",
  ui: "ui design",
  ux: "ux research",
  figma: "figma",
  mongodb: "mongodb",
  mongo: "mongodb",
  sql: "sql",
  nosql: "nosql",
  aws: "aws",
  gcp: "gcp",
  azure: "azure",
  cicd: "ci/cd",
  "ci-cd": "ci/cd",
  "ci/cd": "ci/cd",
  qa: "software testing",
  testing: "software testing",
  pytest: "software testing",
  junit: "software testing",
  rest: "rest apis",
  api: "apis",
  apis: "apis",
  "react native": "react native",
  kotlin: "kotlin",
  swift: "swift",
  uiux: "ui design",
  "user research": "ux research",
  "data viz": "data visualization"
};

function normalizeText(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[+]/g, " ")
    .replace(/[^\w\s./-]/g, "")
    .replace(/\s+/g, " ");
}

function canonicalizeSkill(skill = "") {
  const normalized = normalizeText(skill);
  return SKILL_ALIASES[normalized] || normalized;
}

function collectSkills(student = {}) {
  const directSkills = Array.isArray(student.skills) ? student.skills : [];
  const technicalSkills = Array.isArray(student.technicalSkills) ? student.technicalSkills : [];
  return Array.from(
    new Set(
      [...directSkills, ...technicalSkills]
        .map((skill) => String(skill || "").trim())
        .filter(Boolean)
    )
  );
}

async function getCareerCatalog() {
  const careers = await Career.find({})
    .select("careerName description requiredSkills salaryRange demandLevel industry")
    .lean();

  return careers.length ? careers : careerSeedData;
}

function buildRecommendations(student = {}, careers = []) {
  const studentSkills = collectSkills(student);
  const studentSkillSet = new Set(studentSkills.map((skill) => canonicalizeSkill(skill)));

  const recommendations = careers
    .map((career) => {
      const requiredSkills = Array.isArray(career.requiredSkills) ? career.requiredSkills.filter(Boolean) : [];
      const matchedSkills = requiredSkills.filter((skill) => studentSkillSet.has(canonicalizeSkill(skill)));
      const missingSkills = requiredSkills.filter((skill) => !studentSkillSet.has(canonicalizeSkill(skill)));
      const matchPercentage = requiredSkills.length
        ? Number(((matchedSkills.length / requiredSkills.length) * 100).toFixed(1))
        : 0;

      return {
        careerName: career.careerName,
        description: career.description || "",
        requiredSkills,
        matchedSkills,
        missingSkills,
        matchPercentage,
        matchScore: matchPercentage,
        salaryRange: career.salaryRange || "N/A",
        demandLevel: career.demandLevel || "medium",
        industry: career.industry || "",
        isBestMatch: false
      };
    })
    .sort((left, right) => {
      if (right.matchPercentage === left.matchPercentage) {
        if (right.matchedSkills.length === left.matchedSkills.length) {
          return left.careerName.localeCompare(right.careerName);
        }
        return right.matchedSkills.length - left.matchedSkills.length;
      }
      return right.matchPercentage - left.matchPercentage;
    });

  if (recommendations[0]) {
    recommendations[0].isBestMatch = true;
  }

  return recommendations;
}

async function recommendCareers(student = {}, options = {}) {
  const careers = await getCareerCatalog();
  const recommendations = buildRecommendations(student, careers);
  const limit = Number.isInteger(options.limit) ? options.limit : 5;
  return recommendations.slice(0, limit);
}

async function recommendCareer(student = {}) {
  const [bestMatch] = await recommendCareers(student, { limit: 1 });
  return bestMatch?.careerName || "";
}

async function getCareerMatch(student = {}, careerName = "") {
  if (!careerName) {
    return null;
  }

  const careers = await getCareerCatalog();
  const recommendations = buildRecommendations(student, careers);
  return (
    recommendations.find(
      (career) => normalizeText(career.careerName) === normalizeText(careerName)
    ) || null
  );
}

module.exports = {
  careerProfiles: careerSeedData,
  canonicalizeSkill,
  collectSkills,
  getCareerCatalog,
  getCareerMatch,
  recommendCareer,
  recommendCareers
};
