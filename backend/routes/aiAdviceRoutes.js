const express = require("express");
const { getAdvice } = require("../controllers/aiAdviceController");

const router = express.Router();

router.post("/career-advice", getAdvice);

module.exports = router;
