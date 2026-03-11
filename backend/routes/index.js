const express = require("express");
const { login, register } = require("../controllers/authController");
const authRoutes = require("./authRoutes");
const careerRoutes = require("./careerRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.use("/auth", authRoutes);
router.use("/career", careerRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
