const express = require("express");
const { getDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.post("/", getDashboard);

module.exports = router;
