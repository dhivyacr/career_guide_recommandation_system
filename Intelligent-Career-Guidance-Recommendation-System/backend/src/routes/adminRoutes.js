const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { getAllUsers, getAnalytics } = require("../controllers/admin/adminController");

const router = express.Router();

router.get("/admin/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/admin/analytics", authMiddleware, roleMiddleware("admin"), getAnalytics);

module.exports = router;
