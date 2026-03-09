const express = require("express");
const authRoutes = require("./authRoutes");
const careerRoutes = require("./careerRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/career", careerRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
