const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const apiRoutes = require("./routes");
const { seedCareersIfEmpty } = require("./seeds/seedCareers");
const studentRoutes = require("./routes/studentRoutes");
const recommendRoutes = require("./routes/recommendRoutes");
const skillGapRoutes = require("./routes/skillGapRoutes");
const learningPathRoutes = require("./routes/learningPathRoutes");
const aiAdviceRoutes = require("./routes/aiAdviceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const readinessRoutes = require("./routes/readinessRoutes");
const adminNoteRoutes = require("./routes/adminNoteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const mentorRoutes = require("./routes/mentorRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Intelligent Career Guidance API running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", apiRoutes);
app.use("/api", studentRoutes);
app.use("/api/careers", recommendRoutes);
app.use("/api/career", recommendRoutes);
app.use("/api/skills", skillGapRoutes);
app.use("/api/learning", learningPathRoutes);
app.use("/api/ai", aiAdviceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/readiness", readinessRoutes);
app.use("/api/admin-notes", adminNoteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mentor", mentorRoutes);

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: "Internal server error"
  });
});

connectDB()
  .then(async () => {
    const seedResult = await seedCareersIfEmpty();
    if (seedResult.seeded) {
      console.log(`Career seed completed with ${seedResult.count} records`);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect DB:", error);
    process.exit(1);
  });
