const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const studentController = require("../controllers/studentController");

const router = express.Router();

router.get("/students", authMiddleware, studentController.getAllStudents);
router.post("/feedback", authMiddleware, studentController.saveFeedback);
router.put("/student/update", authMiddleware, studentController.updateProfile);
router.post("/student/profile", authMiddleware, studentController.saveProfile);
router.post("/student/update-profile", authMiddleware, studentController.updateProfile);
router.get("/student/profile", authMiddleware, studentController.getProfile);
router.get("/student/profile/:email", authMiddleware, studentController.getProfileByEmail);
router.get("/student/guidance", authMiddleware, studentController.getGuidance);
router.post("/student/recommend-career", authMiddleware, studentController.recommendCareerForStudent);
router.get("/student/:registerNumber", authMiddleware, studentController.getStudentByRegisterNumber);

module.exports = router;
