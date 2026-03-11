const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");

const DEFAULT_ADMIN = {
  name: "Admin",
  email: "admin@careerai.com",
  password: "admin123",
  role: "admin"
};

const DEFAULT_MENTORS = [
  {
    name: "Mentor1",
    email: "mentor1@careerai.com",
    password: "mentor123",
    role: "mentor"
  },
  {
    name: "Mentor2",
    email: "mentor2@careerai.com",
    password: "mentor123",
    role: "mentor"
  }
];

function buildStudentSeed(index) {
  const studentNumber = index + 1;
  const padded = String(studentNumber).padStart(2, "0");

  return {
    name: `Student ${padded}`,
    email: `student${studentNumber}@careerai.com`,
    password: "student123",
    role: "student",
    regNo: `STU${String(studentNumber).padStart(3, "0")}`,
    technicalSkills:
      studentNumber % 3 === 0
        ? ["Python", "Machine Learning"]
        : studentNumber % 2 === 0
          ? ["HTML", "CSS", "React"]
          : ["SQL", "Python"],
    interests:
      studentNumber % 3 === 0
        ? ["AI", "Data Science"]
        : studentNumber % 2 === 0
          ? ["Frontend Development"]
          : ["Analytics"],
    careerGoal:
      studentNumber % 3 === 0
        ? "Machine Learning Engineer"
        : studentNumber % 2 === 0
          ? "Frontend Developer"
          : "Data Analyst",
    performanceScore: 65 + (studentNumber % 5) * 5
  };
}

async function createAuthUser(seed) {
  const hashedPassword = await bcrypt.hash(seed.password, 10);

  return User.create({
    name: seed.name,
    email: seed.email,
    password: hashedPassword,
    role: seed.role
  });
}

async function resetCollections() {
  await Promise.all([
    User.deleteMany({}),
    Mentor.deleteMany({}),
    Student.deleteMany({})
  ]);
}

async function createAdmin() {
  await createAuthUser(DEFAULT_ADMIN);
  console.log("Default admin created");
}

async function createMentors() {
  for (const mentorSeed of DEFAULT_MENTORS) {
    await createAuthUser(mentorSeed);
    await Mentor.create({
      name: mentorSeed.name,
      email: mentorSeed.email,
      studentsAssigned: 0,
      students: []
    });
  }

  console.log("2 mentors created");
}

async function createStudents(total = 40) {
  for (let index = 0; index < total; index += 1) {
    const studentSeed = buildStudentSeed(index);
    const hashedPassword = await bcrypt.hash(studentSeed.password, 10);

    await User.create({
      name: studentSeed.name,
      email: studentSeed.email,
      password: hashedPassword,
      role: "student"
    });

    await Student.create({
      name: studentSeed.name,
      email: studentSeed.email,
      password: hashedPassword,
      role: "student",
      regNo: studentSeed.regNo,
      technicalSkills: studentSeed.technicalSkills,
      interests: studentSeed.interests,
      careerGoal: studentSeed.careerGoal,
      performanceScore: studentSeed.performanceScore,
      profileCompleted: true
    });
  }

  console.log("40 students created");
}

async function seedDatabase() {
  await resetCollections();
  await createAdmin();
  await createMentors();
  await createStudents();
}

module.exports = {
  seedDatabase
};
