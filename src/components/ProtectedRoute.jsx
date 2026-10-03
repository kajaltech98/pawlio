import { Navigate, useLocation } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="dashboard-loading" style={{ minHeight: "100vh" }}>
        <PawPrint size={35} />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    // Preserve attempted URL location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
