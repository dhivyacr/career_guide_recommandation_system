const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");

const JWT_SECRET = process.env.JWT_SECRET || "career_ai_secret_key";
const MENTOR_EMAILS = new Set(["nithin.ad@bitsathy.ac.in"]);

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function resolveRoleFromEmail(email) {
  if (MENTOR_EMAILS.has(email)) {
    return "mentor";
  }

  return "student";
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const rawPassword = String(password || "");

    if (!name || !normalizedEmail || !rawPassword) {
      return res.status(400).json({
        message: "name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "student"
    });

    return res.status(201).json({
      message: "User registered successfully",
      token: signToken(user),
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: "email is required" });
    }

    if (!normalizedEmail.endsWith("@bitsathy.ac.in")) {
      return res.status(400).json({
        message: "Only bitsathy.ac.in emails allowed"
      });
    }

    if (normalizedEmail === "admin@bitsathy.ac.in") {
      return res.status(200).json({
        message: "Admin login successful",
        role: "admin",
        token: jwt.sign({ role: "admin", email: normalizedEmail }, JWT_SECRET, { expiresIn: "7d" }),
        user: {
          name: "Admin",
          email: "admin@bitsathy.ac.in",
          role: "admin"
        }
      });
    }

    let user = await User.findOne({ email: normalizedEmail });
    const resolvedRole = resolveRoleFromEmail(normalizedEmail);

    if (!user) {
      user = await User.create({
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        role: resolvedRole
      });
    } else if (user.role !== resolvedRole && normalizedEmail !== "admin@bitsathy.ac.in") {
      user.role = resolvedRole;
      await user.save();
    }

    let studentProfile = null;
    if (user.role === "student") {
      studentProfile = await Student.findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            name: user.name || normalizedEmail.split("@")[0],
            email: user.email,
            role: "student"
          },
          $setOnInsert: {
            userId: user._id
          }
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      ).select("-password");
    }

    return res.status(200).json({
      message: "Login successful",
      role: user.role,
      token: jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" }),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registerNumber: studentProfile?.regNo || ""
      },
      profileCompleted: user.role === "student"
        ? Boolean(studentProfile?.regNo && (studentProfile?.profileComplete || studentProfile?.profileCompleted))
        : true
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login
};
