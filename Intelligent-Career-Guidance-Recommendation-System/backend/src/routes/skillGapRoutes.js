const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getSkillGapAnalysis } = require("../controllers/skillGap/skillGapController");

const router = express.Router();

router.post("/skill-gap", authMiddleware, getSkillGapAnalysis);

module.exports = router;
