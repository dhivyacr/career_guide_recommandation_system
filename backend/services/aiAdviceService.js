const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function normalizeSkills(profile = {}) {
  const rawSkills = Array.isArray(profile.skills)
    ? profile.skills
    : String(profile.skills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
  const rawTechnicalSkills = Array.isArray(profile.technicalSkills)
    ? profile.technicalSkills
    : String(profile.technicalSkills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

  return [...rawSkills, ...rawTechnicalSkills];
}

async function generateAdvice(profile = {}) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_KEY" || apiKey === "your_gemini_api_key_here") {
      return "AI advice currently unavailable. Add a valid GEMINI_API_KEY in backend/.env.";
    }

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-pro" });
    const skills = normalizeSkills(profile).join(", ");

    const prompt = `
You are an AI career mentor.

Student Details:
Name: ${profile.name || "N/A"}
Degree: ${profile.degree || "N/A"}
Skills: ${skills || "N/A"}
Recommended Career: ${profile.career || profile.targetCareer || profile.careerGoal || "N/A"}

Suggest:
1. Best career path
2. Missing skills
3. Learning advice
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.log("AI error:", err?.message || err);
    return "AI advice currently unavailable.";
  }
}

async function generateCareerAdvice(student = {}) {
  return generateAdvice(student);
}

module.exports = {
  generateAdvice,
  generateCareerAdvice
};
