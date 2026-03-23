const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");

const JWT_SECRET = process.env.JWT_SECRET || "career_guidance_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const MENTOR_EMAILS = new Set(["nithin.ad@bitsathy.ac.in"]);
const ADMIN_EMAIL = "admin@bitsathy.ac.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const BITSATHY_DOMAIN = "@bitsathy.ac.in";
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
const DEPARTMENT_MAP = {
  cse: "Computer Science Engineering",
  it: "Information Technology",
  ai: "Artificial Intelligence",
  al: "Artificial Intelligence and Machine Learning",
  ece: "Electronics and Communication Engineering",
  eee: "Electrical and Electronics Engineering",
  mech: "Mechanical Engineering",
  civil: "Civil Engineering"
};

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePassword(value) {
  return String(value || "");
}

function isBitsathyEmail(email) {
  return email.endsWith(BITSATHY_DOMAIN);
}

function getDisplayName(email, fallbackName = "") {
  const normalizedName = String(fallbackName || "").trim();
  return normalizedName || email.split("@")[0];
}

function generateRegNo(email) {
  const username = email.split("@")[0] || "";
  const trailingAcademicCode = username.match(/([a-z]+)(\d{2})$/i);

  if (trailingAcademicCode) {
    return `${trailingAcademicCode[1]}${trailingAcademicCode[2]}`.toUpperCase();
  }

  return username.trim();
}

function resolveRoleFromEmail(email) {
  if (email === ADMIN_EMAIL) {
    return "admin";
  }

  if (MENTOR_EMAILS.has(email)) {
    return "mentor";
  }

  return "student";
}

function extractAcademicDetails(email) {
  const localPart = email.split("@")[0] || "";
  const emailParts = localPart.split(".");
  const academicSegment = emailParts[emailParts.length - 1] || "";
  const match = academicSegment.match(/^([a-z]+)(\d{2})$/i);

  if (!match) {
    return {
      department: "Unknown",
      departmentCode: "",
      batch: "",
      year: ""
    };
  }

  const departmentCode = match[1].toLowerCase();
  const batchYear = match[2];

  return {
    department: DEPARTMENT_MAP[departmentCode] || "Unknown",
    departmentCode,
    batch: `20${batchYear}`,
    year: `20${batchYear}`
  };
}

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function ensureStudentProfile(user) {
  const email = normalizeEmail(user.email);
  const regNo = generateRegNo(email);
  const existingUser = await Student.findOne({ email }).select("-password");

  if (existingUser) {
    return Student.findOneAndUpdate(
      { email },
      {
        $set: {
          userId: user._id,
          name: user.name || getDisplayName(email),
          email,
          role: "student",
          regNo: existingUser.regNo || regNo
        }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    ).select("-password");
  }

  return Student.create({
    userId: user._id,
    name: user.name || getDisplayName(email),
    email,
    role: "student",
    regNo
  });
}

async function createUser({ email, password, role, name }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const academicDetails = role === "student" ? extractAcademicDetails(email) : {};

  return User.create({
    name: getDisplayName(email, name),
    email,
    password: hashedPassword,
    role,
    ...academicDetails
  });
}

async function verifyAndRepairPassword(user, password) {
  if (!user.password) {
    return false;
  }

  if (BCRYPT_HASH_PATTERN.test(user.password)) {
    return bcrypt.compare(password, user.password);
  }

  if (user.password !== password) {
    return false;
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();
  return true;
}

function buildAuthResponse(user, studentProfile, message) {
  return {
    message,
    token: signToken(user),
    user: {
      id: user._id,
      email: user.email,
      role: user.role
    }
  };
}

async function register(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = normalizePassword(req.body?.password);
    const name = String(req.body?.name || "").trim();

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    if (!isBitsathyEmail(email)) {
      return res.status(400).json({ message: "Please use your BIT institutional email." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const role = resolveRoleFromEmail(email);
    const user = await createUser({
      email,
      password: role === "admin" ? ADMIN_PASSWORD : password,
      role,
      name
    });
    const studentProfile = role === "student" ? await ensureStudentProfile(user) : null;

    return res.status(201).json(buildAuthResponse(user, studentProfile, "User registered successfully"));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }

    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = normalizePassword(req.body?.password);

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "password is required" });
    }

    if (!isBitsathyEmail(email)) {
      return res.status(400).json({ message: "Please use your BIT institutional email." });
    }

    const role = resolveRoleFromEmail(email);
    let user = await User.findOne({ email }).select("+password");
    let message = "Login successful";

    if (!user) {
      user = await createUser({
        email,
        password: role === "admin" ? ADMIN_PASSWORD : password,
        role,
        name: role === "admin" ? "Admin" : ""
      });
      message = "User created and login successful";
    } else {
      const passwordToVerify = role === "admin" ? ADMIN_PASSWORD : password;
      const passwordMatches = await verifyAndRepairPassword(user, passwordToVerify);

      if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const expectedName = role === "admin" ? "Admin" : getDisplayName(email, user.name);
      const academicDetails = role === "student" ? extractAcademicDetails(email) : null;
      const shouldUpdateAcademicDetails =
        role === "student" &&
        (user.department !== academicDetails.department ||
          user.departmentCode !== academicDetails.departmentCode ||
          user.batch !== academicDetails.batch);

      if (user.role !== role || user.name !== expectedName || shouldUpdateAcademicDetails) {
        user.role = role;
        user.name = expectedName;

        if (academicDetails) {
          user.department = academicDetails.department;
          user.departmentCode = academicDetails.departmentCode;
          user.batch = academicDetails.batch;
          user.year = academicDetails.year;
        }

        await user.save();
      }
    }

    const studentProfile = user.role === "student" ? await ensureStudentProfile(user) : null;

    return res.status(200).json(buildAuthResponse(user, studentProfile, message));
  } catch (error) {
    return next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile
};
