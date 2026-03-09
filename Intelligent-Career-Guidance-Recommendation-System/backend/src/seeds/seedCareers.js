const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Career = require("../models/Career");

const careers = [
  {
    title: "Data Scientist",
    description: "Build predictive models and derive insights from complex datasets.",
    requiredSkills: ["python", "statistics", "machine learning", "sql"],
    relatedInterests: ["analytics", "ai", "research"],
    preferredEducation: "bachelor",
    industry: "Technology"
  },
  {
    title: "Frontend Developer",
    description: "Develop interactive user interfaces for web applications.",
    requiredSkills: ["javascript", "react", "html", "css"],
    relatedInterests: ["design", "web development", "ui ux"],
    preferredEducation: "bachelor",
    industry: "Software"
  },
  {
    title: "Cybersecurity Analyst",
    description: "Monitor and protect systems, networks, and data from cyber threats.",
    requiredSkills: ["network security", "risk assessment", "incident response"],
    relatedInterests: ["security", "problem solving", "forensics"],
    preferredEducation: "bachelor",
    industry: "Information Security"
  }
];

async function seed() {
  try {
    await connectDB();
    await Career.deleteMany({});
    await Career.insertMany(careers);
    console.log("Career seed completed");
  } catch (error) {
    console.error("Career seed failed", error);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
