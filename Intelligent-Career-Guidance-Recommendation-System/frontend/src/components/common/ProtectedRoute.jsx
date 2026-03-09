import { Navigate } from "react-router-dom";

function ProtectedRoute({ isAllowed = true, children }) {
  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
