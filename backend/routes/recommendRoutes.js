const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getCareerByRegisterNumber, getRecommendations } = require("../controllers/recommendController");

const router = express.Router();

router.post("/recommend", authMiddleware, getRecommendations);
router.get("/:registerNumber", authMiddleware, getCareerByRegisterNumber);

module.exports = router;
