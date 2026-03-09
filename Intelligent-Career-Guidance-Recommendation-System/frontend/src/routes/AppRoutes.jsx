import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "../features/landing/pages/LandingPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import StudentDashboardPage from "../features/studentDashboard/pages/StudentDashboardPage";
import RecommendationsPage from "../features/recommendations/pages/RecommendationsPage";
import SkillGapPage from "../features/skillGap/pages/SkillGapPage";
import AdminDashboardPage from "../features/adminDashboard/pages/AdminDashboardPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<StudentDashboardPage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="/skill-gap" element={<SkillGapPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
