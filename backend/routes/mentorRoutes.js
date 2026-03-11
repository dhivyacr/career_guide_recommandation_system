const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getMentorDashboard, getAssignedStudents, giveFeedback } = require("../controllers/mentorController");

const router = express.Router();

router.get("/dashboard", authMiddleware, roleMiddleware("mentor", "faculty", "admin"), getMentorDashboard);
router.get("/students", authMiddleware, roleMiddleware("mentor", "faculty", "admin"), getAssignedStudents);
router.post("/feedback", authMiddleware, roleMiddleware("mentor", "faculty", "admin"), giveFeedback);

module.exports = router;
