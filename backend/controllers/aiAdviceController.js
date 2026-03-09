const { generateCareerAdvice } = require("../services/aiAdviceService");

const getAdvice = async (req, res) => {
  try {
    const student = req.body || {};
    const advice = await generateCareerAdvice(student);
    return res.json({ advice });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate AI advice"
    });
  }
};

module.exports = {
  getAdvice
};
