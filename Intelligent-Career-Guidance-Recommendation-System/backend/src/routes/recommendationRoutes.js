const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { recommendCareer } = require("../controllers/recommendation/recommendationController");

const router = express.Router();

router.post("/recommend-career", authMiddleware, recommendCareer);

module.exports = router;
