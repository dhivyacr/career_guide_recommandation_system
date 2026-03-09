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
import Career from "./pages/Career";
import SettingsPage from "./pages/SettingsPage";
import StudentDashboardLayout from "./layouts/StudentDashboardLayout";
import AdminStudents from "./pages/AdminStudents";

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
              <StudentDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/career" element={<Career />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route
          path="/student-profile"
          element={
            <ProtectedRoute>
              <Navigate to="/profile" replace />
            </ProtectedRoute>
          }
        />
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
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <AdminRoute>
              <AdminStudents />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
