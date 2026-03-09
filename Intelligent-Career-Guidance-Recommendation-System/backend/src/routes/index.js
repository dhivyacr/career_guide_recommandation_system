const express = require("express");
const authRoutes = require("./authRoutes");
const studentRoutes = require("./studentRoutes");
const recommendationRoutes = require("./recommendationRoutes");
const skillGapRoutes = require("./skillGapRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.use(authRoutes);
router.use(studentRoutes);
router.use(recommendationRoutes);
router.use(skillGapRoutes);
router.use(adminRoutes);

module.exports = router;
