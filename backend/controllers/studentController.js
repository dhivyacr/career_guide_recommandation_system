const Student = require("../models/Student");

exports.saveProfile = async (req, res) => {
  try {
    const { regNo = "" } = req.body || {};
    if (!String(regNo).trim()) {
      return res.status(400).json({
        message: "regNo is required"
      });
    }

    const student = new Student(req.body);
    await student.save();

    return res.json({
      message: "Profile saved successfully",
      student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Registration number already exists"
      });
    }
    return res.status(500).json({
      message: "Error saving profile"
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { regNo = "" } = req.query;

    if (!regNo) {
      return res.status(400).json({
        message: "regNo query param is required"
      });
    }

    const student = await Student.findOne({ regNo: String(regNo).trim() }).sort({ createdAt: -1 });

    if (!student) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    return res.json({
      student
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching profile"
    });
  }
};
