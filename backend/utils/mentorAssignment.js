const Mentor = require("../models/Mentor");
const Student = require("../models/Student");

async function assignMentorToStudent(student) {
  if (!student) {
    throw new Error("Student is required");
  }

  if (student.mentorId) {
    return student;
  }

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

  const updatedStudent = await Student.findOneAndUpdate(
    {
      _id: student._id,
      $or: [{ mentorId: null }, { mentorId: { $exists: false } }]
    },
    {
      $set: { mentorId: mentor._id, mentorName: mentor.name || "Unassigned" }
    },
    {
      new: true
    }
  );

  if (updatedStudent) {
    return updatedStudent;
  }

  const currentStudent = await Student.findById(student._id);

  if (!currentStudent || String(currentStudent.mentorId) !== String(mentor._id)) {
    await Mentor.updateOne(
      { _id: mentor._id },
      {
        $pull: { students: student._id },
        $inc: { studentsAssigned: -1 }
      }
    );
  }

  return currentStudent;
}

module.exports = {
  assignMentorToStudent
};
