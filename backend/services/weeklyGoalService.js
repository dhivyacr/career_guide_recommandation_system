const WeeklyGoal = require("../models/WeeklyGoal");

const WEEK_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const GOAL_TEMPLATES = {
  Git: [
    "Complete 3 Git modules",
    "Practice Git branching",
    "Create a repository and push a sample project"
  ],
  "UI Design": [
    "Learn UI design fundamentals",
    "Build 1 simple UI layout",
    "Review spacing, typography, and color basics"
  ],
  "Node.js": [
    "Complete Node.js basics tutorial",
    "Build a simple REST API",
    "Practice routing and middleware concepts"
  ],
  React: [
    "Build one reusable React component",
    "Practice state handling and props",
    "Complete 2 React UI modules"
  ],
  JavaScript: [
    "Solve 5 JavaScript practice problems",
    "Review array, object, and async concepts",
    "Build a small interactive feature"
  ],
  Python: [
    "Complete 3 Python practice modules",
    "Write scripts for data handling basics",
    "Practice functions, loops, and file operations"
  ],
  SQL: [
    "Practice 10 SQL queries",
    "Design one basic relational schema",
    "Build a query report using filtering and joins"
  ]
};

function startOfCurrentCycle(now = new Date()) {
  return new Date(now);
}

function endOfCycle(startDate) {
  return new Date(startDate.getTime() + WEEK_DURATION_MS);
}

function buildFallbackTemplates(skill) {
  return [
    `Complete 3 ${skill} learning modules`,
    `Practice one hands-on exercise in ${skill}`,
    `Build a mini task using ${skill}`
  ];
}

function generateGoalDefinitions(skillGap = []) {
  const normalizedSkills = Array.isArray(skillGap) ? skillGap.filter(Boolean) : [];

  if (!normalizedSkills.length) {
    return [];
  }

  const goals = [];
  let skillIndex = 0;
  const templateUsage = new Map();

  while (goals.length < 3 && normalizedSkills.length) {
    const skill = normalizedSkills[skillIndex % normalizedSkills.length];
    const templates = GOAL_TEMPLATES[skill] || buildFallbackTemplates(skill);
    const templateIndex = templateUsage.get(skill) || 0;

    if (templateIndex >= templates.length) {
      skillIndex += 1;
      if (skillIndex > normalizedSkills.length * 3) {
        break;
      }
      continue;
    }

    goals.push({
      skill,
      goalTitle: templates[templateIndex]
    });
    templateUsage.set(skill, templateIndex + 1);
    skillIndex += 1;
  }

  return goals.slice(0, 3);
}

function summarizeGoals(goals = []) {
  const total = goals.length;
  const completed = goals.filter((goal) => goal.completed).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return {
    goals: goals.map((goal) => ({
      _id: goal._id,
      goalTitle: goal.goalTitle,
      skill: goal.skill,
      completed: Boolean(goal.completed),
      createdAt: goal.createdAt,
      cycleStartedAt: goal.cycleStartedAt,
      cycleEndsAt: goal.cycleEndsAt
    })),
    completed,
    total,
    progress,
    message: total && completed === total ? "Great work! Weekly goal completed 🎉" : "",
    targetText: goals[0]?.skill
      ? `Focus on ${goals[0].skill} and your other key gaps this week.`
      : "No weekly goals available right now."
  };
}

async function getActiveGoals(userId, now = new Date()) {
  return WeeklyGoal.find({
    userId,
    cycleEndsAt: { $gt: now }
  })
    .sort({ createdAt: 1 })
    .lean();
}

async function createGoalsForCycle(userId, skillGap = [], now = new Date()) {
  const definitions = generateGoalDefinitions(skillGap);
  const cycleStartedAt = startOfCurrentCycle(now);
  const cycleEndsAt = endOfCycle(cycleStartedAt);

  if (!definitions.length) {
    return [];
  }

  const created = await WeeklyGoal.insertMany(
    definitions.map((goal) => ({
      userId,
      goalTitle: goal.goalTitle,
      skill: goal.skill,
      completed: false,
      cycleStartedAt,
      cycleEndsAt
    }))
  );

  return created.map((goal) => goal.toObject());
}

async function getOrCreateWeeklyGoals(userId, skillGap = [], now = new Date()) {
  const activeGoals = await getActiveGoals(userId, now);

  if (activeGoals.length) {
    return summarizeGoals(activeGoals);
  }

  const newGoals = await createGoalsForCycle(userId, skillGap, now);
  return summarizeGoals(newGoals);
}

async function toggleWeeklyGoal(userId, goalId, completed) {
  const goal = await WeeklyGoal.findOneAndUpdate(
    { _id: goalId, userId },
    { $set: { completed: Boolean(completed) } },
    { new: true }
  );

  if (!goal) {
    return null;
  }

  const goals = await WeeklyGoal.find({
    userId,
    cycleStartedAt: goal.cycleStartedAt,
    cycleEndsAt: goal.cycleEndsAt
  })
    .sort({ createdAt: 1 })
    .lean();

  return summarizeGoals(goals);
}

module.exports = {
  generateGoalDefinitions,
  getOrCreateWeeklyGoals,
  summarizeGoals,
  toggleWeeklyGoal
};
