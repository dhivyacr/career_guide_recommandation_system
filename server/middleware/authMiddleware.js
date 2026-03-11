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
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === "student") {
      req.student = await Student.findOne({ email: user.email });
      if (req.student) {
        req.user.id = req.student._id;
      }
    }

    if (["mentor", "faculty"].includes(user.role)) {
      req.mentor = await Mentor.findOne({ email: user.email });
      if (req.mentor) {
        req.user.id = req.mentor._id;
      }
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

module.exports = {
  authMiddleware,
  authorize
};
