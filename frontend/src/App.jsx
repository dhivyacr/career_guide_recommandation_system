import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import StudentProfile from "./pages/StudentProfile";
import CompleteProfile from "./pages/CompleteProfile";
import Career from "./pages/Career";
import Portfolio from "./pages/Portfolio";
import SettingsPage from "./pages/SettingsPage";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminStudents from "./pages/AdminStudents";
import AdminStudentProfile from "./pages/AdminStudentProfile";
import Reports from "./pages/admin/Reports";
import CareerMentor from "./pages/CareerMentor";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout role="student" />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/career" element={<Career />} />
          <Route path="/career-mentor" element={<CareerMentor />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/student-profile" element={<Navigate to="/profile" replace />} />
        </Route>
        <Route path="/student-profile/edit" element={<Navigate to="/profile" replace />} />
        <Route
          path="/career-paths"
          element={
            <ProtectedRoute>
              <Navigate to="/career" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career/recommendation"
          element={
            <ProtectedRoute>
              <Navigate to="/career" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career/skill-match"
          element={
            <ProtectedRoute>
              <Navigate to="/career" replace />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <AdminRoute>
              <DashboardLayout role="admin" />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/leaderboard" element={<Navigate to="/admin/students" replace />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="/mentor-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/student/:registerNumber" element={<AdminStudentProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
