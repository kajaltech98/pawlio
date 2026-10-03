import { Navigate } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="dashboard-loading" style={{ minHeight: "100vh" }}>
        <PawPrint size={35} />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (user) {
    // Authenticated users cannot access login/register unnecessarily
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
