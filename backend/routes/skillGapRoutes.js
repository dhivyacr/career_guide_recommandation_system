const express = require("express");
const { getSkillGap } = require("../controllers/skillGapController");

const router = express.Router();

router.post("/skill-gap", getSkillGap);

module.exports = router;
