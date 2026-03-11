const express = require("express");
const { authMiddleware, authorize } = require("../middleware/authMiddleware");
const mentorController = require("../controllers/mentorController");

const router = express.Router();

router.get("/students", authMiddleware, authorize("mentor", "faculty"), mentorController.getStudents);
router.post("/feedback", authMiddleware, authorize("mentor", "faculty"), mentorController.submitFeedback);

module.exports = router;
