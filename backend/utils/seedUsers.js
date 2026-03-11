const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const Feedback = require("../models/Feedback");
const { assignMentorToStudent } = require("./mentorAssignment");

const DEFAULT_ADMIN = {
  name: "Admin",
  email: "admin@careerai.com",
  password: "admin123",
  role: "admin"
};

const DEFAULT_MENTORS = [
  { name: "Mentor1", email: "mentor1@careerai.com", password: "mentor123", role: "mentor" },
  { name: "Mentor2", email: "mentor2@careerai.com", password: "mentor123", role: "mentor" }
];

function buildStudentSeed(index) {
  const studentNo = index + 1;
  const suffix = String(studentNo).padStart(2, "0");

  return {
    name: `Student ${suffix}`,
    email: `student${studentNo}@careerai.com`,
    password: "student123",
    role: "student",
    technicalSkills: studentNo % 3 === 0 ? ["Python", "ML"] : studentNo % 2 === 0 ? ["HTML", "CSS", "React"] : ["SQL", "Python"],
    interests: studentNo % 3 === 0 ? ["AI"] : studentNo % 2 === 0 ? ["Design"] : ["Analytics"],
    careerGoal: studentNo % 3 === 0 ? "Machine Learning Engineer" : studentNo % 2 === 0 ? "Frontend Developer" : "Data Analyst",
    performanceScore: 60 + (studentNo % 5) * 8,
    regNo: `STU${String(studentNo).padStart(3, "0")}`,
    profileCompleted: true
  };
}

async function resetDatabase() {
  await Promise.all([
    User.deleteMany({ role: { $in: ["student", "admin", "mentor", "faculty"] } }),
    Student.deleteMany({}),
    Mentor.deleteMany({}),
    Feedback.deleteMany({})
  ]);
}

async function createUser({ name, email, password, role }) {
  return User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role
  });
}

async function createMentors() {
  const mentors = [];

  for (const mentorSeed of DEFAULT_MENTORS) {
    const user = await createUser(mentorSeed);
    const mentor = await Mentor.create({
      name: mentorSeed.name,
      email: mentorSeed.email,
      studentsAssigned: 0,
      students: [],
      userId: user._id
    });

    mentors.push(mentor);
  }

  return mentors;
}

async function createStudents(count = 40) {
  const students = [];

  for (let index = 0; index < count; index += 1) {
    const seed = buildStudentSeed(index);
    const passwordHash = await bcrypt.hash(seed.password, 10);

    await User.create({
      name: seed.name,
      email: seed.email,
      password: passwordHash,
      role: "student"
    });

    let student = await Student.create({
      name: seed.name,
      email: seed.email,
      password: passwordHash,
      role: "student",
      regNo: seed.regNo,
      technicalSkills: seed.technicalSkills,
      interests: seed.interests,
      careerGoal: seed.careerGoal,
      performanceScore: seed.performanceScore,
      profileCompleted: seed.profileCompleted
    });

    student = await assignMentorToStudent(student);

    if (!student?.mentorId) {
      throw new Error("No mentors available");
    }

    students.push(student);
  }

  return students;
}

async function seedUsers() {
  await resetDatabase();

  await createUser(DEFAULT_ADMIN);
  await createMentors();
  await createStudents(40);

  console.log("Database reset complete");
  console.log("Default admin created");
  console.log("2 mentors created");
  console.log("40 students created");

  return { seeded: true };
}

module.exports = {
  seedUsers
};
