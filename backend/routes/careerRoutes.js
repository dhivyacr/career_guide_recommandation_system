const express = require("express");
const { recommendCareer, listCareers, skillGapAnalysis } = require("../controllers/careerController");

const router = express.Router();

router.post("/recommend", recommendCareer);
router.post("/skill-gap", skillGapAnalysis);
router.get("/list", listCareers);

module.exports = router;
