const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getProfile } = require("../controllers/student/profileController");

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);

module.exports = router;
