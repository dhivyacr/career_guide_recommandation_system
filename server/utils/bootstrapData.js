const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const Feedback = require("../models/Feedback");

async function assignMentor(student) {
  const mentor = await Mentor.findOneAndUpdate(
    {
      studentsAssigned: { $lt: 20 },
      students: { $ne: student._id }
    },
    {
      $addToSet: { students: student._id },
      $inc: { studentsAssigned: 1 }
    },
    {
      new: true,
      sort: { createdAt: 1 }
    }
  );

  if (!mentor) {
    return null;
  }

  const updatedStudent = await Student.findByIdAndUpdate(student._id, { mentorId: mentor._id }, { new: true });
  return { mentor, student: updatedStudent };
}

async function seedStudents(count = 40) {
  for (let index = 0; index < count; index += 1) {
    const number = index + 1;
    const email = `student${number}@careerai.com`;
    const passwordHash = await bcrypt.hash("student123", 10);

    await User.create({
      name: `Student ${number}`,
      email,
      password: passwordHash,
      role: "student"
    });

    const student = await Student.create({
      name: `Student ${number}`,
      email,
      skills: number % 4 === 0 ? ["Java", "Spring"] : number % 3 === 0 ? ["Python", "ML"] : number % 2 === 0 ? ["HTML", "CSS", "React"] : ["SQL", "Python"],
      interests: number % 3 === 0 ? ["AI", "Data Science"] : number % 2 === 0 ? ["Frontend", "Design"] : ["Analytics", "Insights"],
      careerGoal: number % 3 === 0 ? "AI Engineer" : number % 2 === 0 ? "Frontend Developer" : "Data Analyst",
      performanceScore: 65 + (number % 5) * 7,
      recommendations: []
    });

    const assignment = await assignMentor(student);
    if (!assignment) {
      throw new Error("No mentors available");
    }
  }
}

async function bootstrapData() {
  await Promise.all([
    User.deleteMany({ role: { $in: ["admin", "student", "mentor"] } }),
    Student.deleteMany({}),
    Mentor.deleteMany({}),
    Feedback.deleteMany({})
  ]);

  await User.create({
    name: "Admin",
    email: "admin@careerai.com",
    password: await bcrypt.hash("admin123", 10),
    role: "admin"
  });

  const mentorSeeds = [
    { name: "Mentor1", email: "mentor1@careerai.com", password: "mentor123" },
    { name: "Mentor2", email: "mentor2@careerai.com", password: "mentor123" }
  ];

  for (const mentorSeed of mentorSeeds) {
    await User.create({
      name: mentorSeed.name,
      email: mentorSeed.email,
      password: await bcrypt.hash(mentorSeed.password, 10),
      role: "mentor"
    });

    await Mentor.create({
      name: mentorSeed.name,
      email: mentorSeed.email,
      studentsAssigned: 0,
      students: []
    });
  }

  await seedStudents(40);
  console.log("System bootstrap complete: admin, mentors, and 40 students created");
}

module.exports = {
  assignMentor,
  bootstrapData
};
