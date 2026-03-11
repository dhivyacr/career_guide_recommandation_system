const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getSkillGap } = require("../controllers/skillGapController");

const router = express.Router();

router.post("/skill-gap", authMiddleware, getSkillGap);

module.exports = router;
