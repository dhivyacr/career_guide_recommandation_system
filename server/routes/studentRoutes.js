const express = require("express");
const { authMiddleware, authorize } = require("../middleware/authMiddleware");
const studentController = require("../controllers/studentController");

const router = express.Router();

router.get("/profile", authMiddleware, authorize("student"), studentController.getProfile);
router.post("/update-profile", authMiddleware, authorize("student"), studentController.updateProfile);
router.post("/recommend-career", authMiddleware, authorize("student"), studentController.recommendCareer);

module.exports = router;
