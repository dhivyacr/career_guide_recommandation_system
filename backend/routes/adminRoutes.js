const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getAnalytics, getStudents, getStudentById, addMentorNote } = require("../controllers/adminController");

const router = express.Router();

router.get("/analytics", authMiddleware, roleMiddleware("admin"), getAnalytics);
router.get("/students", authMiddleware, roleMiddleware("admin"), getStudents);
router.get("/student/:id", authMiddleware, roleMiddleware("admin"), getStudentById);
router.post("/review/:id", authMiddleware, roleMiddleware("admin"), addMentorNote);

module.exports = router;
