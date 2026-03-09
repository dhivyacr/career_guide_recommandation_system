const express = require("express");
const studentController = require("../controllers/studentController");

const router = express.Router();

router.post("/profile", studentController.saveProfile);
router.get("/profile", studentController.getProfile);

module.exports = router;
