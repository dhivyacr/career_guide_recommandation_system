const express = require("express");
const verifyFaculty = require("../middleware/verifyFaculty");
const {
  getAnalytics,
  getDashboard,
  getStudentPerformance,
  getStudents,
  getStudentById,
  addMentorNote,
  addGuidanceEntry,
  updateAdminGuidance,
  resetStudents
} = require("../controllers/adminController");

const router = express.Router();

router.get("/analytics", verifyFaculty, getAnalytics);
router.get("/dashboard", verifyFaculty, getDashboard);
router.get("/student-performance", verifyFaculty, getStudentPerformance);
router.get("/students", verifyFaculty, getStudents);
router.get("/student/:id", verifyFaculty, getStudentById);
router.post("/review/:id", verifyFaculty, addMentorNote);
router.post("/guidance/:studentId", verifyFaculty, addGuidanceEntry);
router.put("/guidance/:registerNumber", verifyFaculty, updateAdminGuidance);
router.delete("/reset-students", verifyFaculty, resetStudents);

module.exports = router;
