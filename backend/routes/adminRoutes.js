const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const {
  getAnalytics,
  getDashboard,
  getStudentPerformance,
  getStudents,
  getStudentById,
  addMentorNote,
  addGuidanceEntry,
  updateAdminGuidance,
  clearStudents,
  getMentors,
  assignMentor
} = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, adminOnly);

router.get("/analytics", getAnalytics);
router.get("/dashboard", getDashboard);
router.get("/student-performance", getStudentPerformance);
router.get("/students", getStudents);
router.get("/mentors", getMentors);
router.get("/student/:id", getStudentById);
router.put("/student/:id/mentor", assignMentor);
router.post("/review/:id", addMentorNote);
router.post("/guidance/:studentId", addGuidanceEntry);
router.put("/guidance/:registerNumber", updateAdminGuidance);
router.delete("/clear-students", clearStudents);

module.exports = router;
