const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");

const JWT_SECRET = process.env.JWT_SECRET || "career_ai_secret_key";

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id || "").select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (user.role === "student") {
      req.student = await Student.findOne({ email: user.email }).select("-password");
      req.user = {
        id: user._id,
        userId: user._id,
        studentId: req.student?._id || null,
        name: user.name,
        email: user.email,
        role: user.role
      };
      return next();
    }

    if (["mentor", "faculty"].includes(user.role)) {
      req.mentor = await Mentor.findOne({ email: user.email });
      req.user = {
        id: user._id,
        userId: user._id,
        mentorId: req.mentor?._id || null,
        name: user.name,
        email: user.email,
        role: user.role
      };
      return next();
    }

    req.user = {
      id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = authMiddleware;
