const Student = require("../models/Student");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { recommendCareer } = require("../services/recommendationService");

function normalizeRegisterNumber(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function buildProfilePayload(body = {}) {
  const registerNumber = normalizeRegisterNumber(body.registerNumber || body.regNo);
  const email = normalizeEmail(body.email);
  const payload = {
    ...body,
    regNo: registerNumber,
    email,
    educationLevel: body.educationLevel || "",
    degree: body.department || body.degree || "",
    year: body.year || "",
    gpa: Number(body.cgpa ?? body.gpa ?? 0) || 0
  };

  delete payload.registerNumber;
  delete payload.department;
  delete payload.cgpa;

  if (!email) {
    delete payload.email;
  }

  if (!body.password) {
    delete payload.password;
  }

  return payload;
}

async function ensureStudentProfileForUser(user) {
  let student = await Student.findOne({
    $or: [
      { userId: user.userId || user.id },
      { email: user.email }
    ]
  }).select("+password");

  if (student) {
    const updates = {};

    if (!student.userId && (user.userId || user.id)) {
      updates.userId = user.userId || user.id;
    }

    if (!student.name && user.name) {
      updates.name = user.name;
    }

    if (!student.email && user.email) {
      updates.email = user.email;
    }

    if (Object.keys(updates).length > 0) {
      student = await Student.findByIdAndUpdate(
        student._id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select("+password");
    }

    return student;
  }

  const baseProfile = {
    userId: user.userId || user.id || null,
    name: user.name || user.email.split("@")[0],
    email: user.email,
    educationLevel: "",
    technicalSkills: [],
    interests: [],
    careerGoal: "",
    profileCompleted: false,
    role: "student"
  };

  student = await Student.create(baseProfile);
  return Student.findById(student._id).select("+password");
}

async function saveProfile(req, res) {
  try {
    const payload = buildProfilePayload(req.body);
    const email = normalizeEmail(payload.email || req.user?.email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!email.endsWith("@bitsathy.ac.in")) {
      return res.status(400).json({ message: "Only bitsathy.ac.in email allowed" });
    }

    const student = await Student.findOneAndUpdate(
      { email },
      {
        $set: {
          userId: req.user?.userId || req.user?.id || null,
          name: payload.name || req.user?.name || email.split("@")[0],
          email,
          regNo: payload.regNo || normalizeRegisterNumber(req.body?.regNo || req.body?.registerNumber),
          degree: payload.degree || String(req.body?.department || "").trim(),
          gpa: Number(payload.gpa ?? req.body?.cgpa ?? 0) || 0,
          technicalSkills: Array.isArray(payload.technicalSkills)
            ? payload.technicalSkills
            : Array.isArray(req.body?.technicalSkills)
              ? req.body.technicalSkills
              : Array.isArray(req.body?.skills)
                ? req.body.skills
                : [],
          interests: Array.isArray(payload.interests) ? payload.interests : Array.isArray(req.body?.interests) ? req.body.interests : [],
          careerGoal: String(payload.careerGoal || req.body?.careerGoal || "").trim(),
          careerPath: String(payload.careerPath || payload.careerGoal || req.body?.careerGoal || "").trim(),
          profileComplete: true,
          profileCompleted: true,
          role: "student"
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: student.name,
          email,
          role: "student"
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({
      message: "Error saving profile"
    });
  }
}

async function updateProfile(req, res) {
  try {
    const payload = buildProfilePayload(req.body);
    const userId = req.user.userId || req.user.id;
    const existingStudent = await Student.findOne({
      $or: [{ userId }, { email: req.user.email }]
    }).select("+password");

    payload.userId = userId;
    payload.email = payload.email || existingStudent?.email || req.user.email;
    payload.name = payload.name || existingStudent?.name || req.user.name || req.user.email.split("@")[0];
    payload.email = normalizeEmail(payload.email);
    payload.profileComplete = true;
    payload.profileCompleted = true;
    payload.regNo = normalizeRegisterNumber(payload.regNo || req.body?.registerNumber || req.body?.regNo);
    payload.degree = String(payload.degree || req.body?.department || req.body?.degree || existingStudent?.degree || "").trim();
    payload.gpa = Number(payload.gpa ?? req.body?.cgpa ?? req.body?.gpa ?? existingStudent?.gpa ?? 0) || 0;
    payload.technicalSkills = Array.isArray(req.body?.skills)
      ? req.body.skills
      : Array.isArray(payload.technicalSkills)
        ? payload.technicalSkills
        : existingStudent?.technicalSkills || [];
    payload.interests = Array.isArray(req.body?.interests)
      ? req.body.interests
      : Array.isArray(payload.interests)
        ? payload.interests
        : existingStudent?.interests || [];

    if (payload.email && payload.email !== existingStudent?.email) {
      const emailOwner = await Student.findOne({
        email: payload.email,
        _id: { $ne: existingStudent?._id }
      });

      if (emailOwner) {
        return res.status(409).json({
          message: "Email already registered"
        });
      }
    }

    if (!payload.email.endsWith("@bitsathy.ac.in")) {
      return res.status(400).json({
        message: "Only bitsathy.ac.in email allowed"
      });
    }

    if (payload.regNo) {
      const registerNumberOwner = await Student.findOne({
        regNo: payload.regNo,
        _id: { $ne: existingStudent?._id }
      });

      if (registerNumberOwner) {
        return res.status(409).json({
          message: "Registration number already exists"
        });
      }
    }

    if (req.body?.password) {
      payload.password = await bcrypt.hash(String(req.body.password), 10);
    } else {
      payload.password = existingStudent?.password;
    }

    payload.careerPath = String(payload.careerPath || payload.careerGoal || existingStudent?.careerPath || "").trim();
    payload.userId = userId;

    const student = await Student.findOneAndUpdate(
      { userId },
      {
        $set: payload
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    const userUpdates = {
      name: payload.name,
      email: payload.email,
      role: "student"
    };

    if (payload.password) {
      userUpdates.password = payload.password;
    }

    await User.findOneAndUpdate({ _id: userId }, userUpdates, {
      new: true,
      runValidators: true
    });

    return res.json({
      message: "Profile saved successfully",
      student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Registration number or email already exists"
      });
    }

    return res.status(500).json({
      message: "Error saving profile"
    });
  }
}

exports.saveProfile = saveProfile;
exports.updateProfile = updateProfile;

exports.getProfile = async (req, res) => {
  try {
    const student = await ensureStudentProfileForUser(req.user);

    return res.json({
      student
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching profile"
    });
  }
};

exports.getProfileByEmail = async (req, res) => {
  try {
    const email = normalizeEmail(req.params?.email);

    if (!email) {
      return res.status(400).json({
        message: "email param is required"
      });
    }

    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    return res.json({
      student: {
        ...student.toObject(),
        registerNumber: student.regNo || "",
        department: student.degree || "",
        cgpa: Number(student.gpa || 0),
        skills: student.technicalSkills || [],
        careerPath: student.careerPath || student.careerGoal || student.careerRecommendation || "",
        mentorFeedback: student.mentorFeedback || student.mentorReview || ""
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching profile"
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({
      $and: [
        { email: /@bitsathy\.ac\.in$/i },
        { email: { $not: /careerai\.com/i } },
        {
          $or: [{ profileComplete: true }, { profileCompleted: true }]
        }
      ]
    })
      .sort({ updatedAt: -1 })
      .select("name email regNo degree gpa technicalSkills interests careerPath careerGoal skillGap mentorFeedback mentorReview updatedAt");

    return res.json(
      students.map((student) => ({
        _id: student._id,
        name: student.name || "",
        email: student.email || "",
        registerNumber: student.regNo || "",
        department: student.degree || "",
        cgpa: Number(student.gpa || 0),
        skills: student.technicalSkills || [],
        interests: student.interests || [],
        careerGoal: student.careerGoal || "",
        careerPath: student.careerPath || student.careerGoal || student.careerRecommendation || "",
        skillGap: student.skillGap || [],
        mentorFeedback: student.mentorFeedback || student.mentorReview || "",
        updatedAt: student.updatedAt
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getStudents = exports.getAllStudents;

exports.saveFeedback = async (req, res) => {
  try {
    const { studentId, feedback } = req.body;

    if (!studentId || !String(feedback || "").trim()) {
      return res.status(400).json({ message: "studentId and feedback are required" });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const message = String(feedback).trim();
    student.mentorReview = message;
    student.mentorFeedback = message;
    student.mentorGuidance = Array.isArray(student.mentorGuidance) ? student.mentorGuidance : [];
    student.mentorGuidance.push({
      message,
      date: new Date()
    });

    await student.save();

    return res.json(student);
  } catch (err) {
    return res.status(500).json({ message: "Error saving feedback" });
  }
};

exports.getStudentByRegisterNumber = async (req, res) => {
  try {
    const registerNumber = String(req.params?.registerNumber || "")
      .trim()
      .toUpperCase();

    if (!registerNumber) {
      return res.status(400).json({
        message: "registerNumber param is required"
      });
    }

    const student = await Student.findOne({ regNo: registerNumber });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const recommendation = recommendCareer({
      technicalSkills: student.technicalSkills || [],
      skills: student.technicalSkills || []
    });

    return res.json({
      student: {
        ...student.toObject(),
        registerNumber: student.regNo || "",
        department: student.degree || "",
        cgpa: Number.parseFloat(student.gpa) || 0,
        skills: student.technicalSkills || [],
        interests: student.interests || [],
        recommendation,
        careerPath: student.careerPath || student.careerGoal || recommendation,
        skillGap: student.skillGap || [],
        mentorFeedback: student.mentorFeedback || student.mentorReview || "",
        adminGuidance: student.mentorFeedback || student.mentorReview || "",
        mentorGuidance: student.mentorGuidance || []
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching student"
    });
  }
};

exports.getGuidance = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    return res.json({
      mentorGuidance: student.mentorGuidance || [],
      adminGuidance: student.mentorFeedback || student.mentorReview || "",
      mentorFeedback: student.mentorFeedback || student.mentorReview || ""
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching guidance"
    });
  }
};

exports.recommendCareerForStudent = async (req, res) => {
  try {
    const skills = Array.isArray(req.body?.skills) ? req.body.skills : [];
    const interests = Array.isArray(req.body?.interests) ? req.body.interests : [];

    const recommendedCareer = recommendCareer({
      skills,
      interests
    });

    return res.json({ recommendedCareer });
  } catch (error) {
    return res.status(500).json({
      message: "Error generating career recommendation"
    });
  }
};
