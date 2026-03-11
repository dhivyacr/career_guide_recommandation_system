const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");

const JWT_SECRET = process.env.JWT_SECRET || "career_ai_secret_key";
const ALLOWED_DOMAIN = "@bitsathy.ac.in";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isAllowedStudentEmail(email) {
  return email.endsWith(ALLOWED_DOMAIN);
}

function buildStudentName(email, fallbackName = "") {
  const trimmedFallback = String(fallbackName || "").trim();
  if (trimmedFallback) {
    return trimmedFallback;
  }

  return normalizeEmail(email).split("@")[0] || "student";
}

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

async function ensureStudentProfile(user, payload = {}) {
  const name = buildStudentName(user.email, payload.name || user.name);

  return Student.findOneAndUpdate(
    { email: user.email },
    {
      $setOnInsert: {
        userId: user._id,
        name,
        email: user.email,
        registerNumber: String(payload.registerNumber || "").trim(),
        department: String(payload.department || "").trim(),
        cgpa: Number(payload.cgpa) || 0,
        skills: Array.isArray(payload.skills) ? payload.skills : [],
        interests: Array.isArray(payload.interests) ? payload.interests : [],
        careerRecommendation: String(payload.careerRecommendation || "").trim(),
        skillGap: Array.isArray(payload.skillGap) ? payload.skillGap : [],
        mentorFeedback: String(payload.mentorFeedback || "").trim()
      },
      $set: {
        userId: user._id,
        name,
        email: user.email
      }
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
}

function buildAuthResponse(user, student) {
  return {
    message: "Authentication successful",
    token: signToken(user),
    role: user.role,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      registerNumber: student?.registerNumber || ""
    },
    student
  };
}

exports.register = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const name = buildStudentName(email, req.body?.name);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!isAllowedStudentEmail(email)) {
      return res.status(400).json({ message: "Only BIT email IDs allowed" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student"
    });

    const student = await ensureStudentProfile(user, req.body);

    return res.status(201).json({
      ...buildAuthResponse(user, student),
      message: "Registration successful"
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }

    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    let user = await User.findOne({ email }).select("+password");

    if (!user && !isAllowedStudentEmail(email)) {
      return res.status(400).json({ message: "Only BIT email IDs allowed" });
    }

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        name: buildStudentName(email),
        email,
        password: hashedPassword,
        role: "student"
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    let student = null;
    if (user.role === "student") {
      student = await ensureStudentProfile(user);
    }

    return res.json({
      ...buildAuthResponse(user, student),
      message: "Login successful"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
