const express = require("express");
const { getLearningPath } = require("../controllers/learningPathController");

const router = express.Router();

router.post("/learning-path", getLearningPath);

module.exports = router;
