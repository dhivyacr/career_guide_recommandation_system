const express = require("express");
const { authMiddleware, authorize } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.get("/dashboard", authMiddleware, authorize("admin"), adminController.getDashboard);
router.get("/student-performance", authMiddleware, authorize("admin"), adminController.getStudentPerformance);
router.get("/students", authMiddleware, authorize("admin"), adminController.getStudents);
router.get("/student/:registerNumber", authMiddleware, authorize("admin"), adminController.getStudentByRegisterNumber);
router.post("/guidance/:studentId", authMiddleware, authorize("admin"), adminController.addGuidance);

module.exports = router;
