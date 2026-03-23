const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboard, updateWeeklyGoal } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", authMiddleware, getDashboard);
router.put("/weekly-goals/:goalId", authMiddleware, updateWeeklyGoal);

module.exports = router;
