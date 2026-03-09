const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const apiRoutes = require("./routes");
const { seedCareersIfEmpty } = require("./seeds/seedCareers");
const studentRoutes = require("./routes/studentRoutes");
const recommendRoutes = require("./routes/recommendRoutes");
const skillGapRoutes = require("./routes/skillGapRoutes");
const learningPathRoutes = require("./routes/learningPathRoutes");
const aiAdviceRoutes = require("./routes/aiAdviceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminNoteRoutes = require("./routes/adminNoteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const User = require("./models/User");

console.log("Loaded Gemini Key:", process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;
const DEFAULT_ADMIN_EMAIL = "admin@careerai.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

async function createDefaultAdmin() {
  const admin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });

  if (!admin) {
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await User.create({
      name: "Admin",
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin"
    });
    console.log("Default admin created");
    return;
  }

  if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
    console.log("Existing user upgraded to admin role");
  }
}

// Middleware
app.use(cors());
app.use(express.json());

/* -------------------------------
   Root route (for browser test)
-------------------------------- */
app.get("/", (req, res) => {
  res.send("🚀 Intelligent Career Guidance API running");
});

/* -------------------------------
   Health check route
-------------------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* -------------------------------
   API Routes
-------------------------------- */
app.use("/api", apiRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/careers", recommendRoutes);
app.use("/api/skills", skillGapRoutes);
app.use("/api/learning", learningPathRoutes);
app.use("/api/ai", aiAdviceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin-notes", adminNoteRoutes);
app.use("/api/admin", adminRoutes);

/* -------------------------------
   Global error handler
-------------------------------- */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: "Internal server error"
  });
});

/* -------------------------------
   Start server after DB connect
-------------------------------- */
connectDB()
  .then(async () => {

    console.log("MongoDB connected");

    // seed careers if DB empty
    const seedResult = await seedCareersIfEmpty();

    if (seedResult.seeded) {
      console.log(`Career seed completed with ${seedResult.count} records`);
    }

    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch((error) => {
    console.error("Failed to connect DB:", error);
    process.exit(1);
  });
