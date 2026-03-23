const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getReadiness } = require("../controllers/readinessController");

const router = express.Router();

router.get("/:userId", authMiddleware, getReadiness);

module.exports = router;
