import { Navigate } from "react-router-dom";

function isTokenValid(token) {
  if (!token) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!role || !isTokenValid(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    return <Navigate to="/login" replace />;
  }

  if (!["faculty", "mentor", "admin"].includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;
