const express = require("express");
const { getRecommendations } = require("../controllers/recommendController");

const router = express.Router();

router.post("/recommend", getRecommendations);

module.exports = router;
