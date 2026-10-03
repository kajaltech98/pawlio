import { useEffect, useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { PawPrint, ShieldAlert, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { checkUserIsAdmin, setAdminRoleOverride } from "../../lib/adminService";

export default function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);

  const verifyRole = async () => {
    if (!user) {
      setCheckingRole(false);
      return;
    }
    try {
      const adminStatus = await checkUserIsAdmin(user);
      setIsAdmin(adminStatus);
    } catch (err) {
      console.error("Error verifying admin role:", err);
      setIsAdmin(false);
    } finally {
      setCheckingRole(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      verifyRole();
    }
  }, [user, authLoading]);

  // Handle granting dev test access if needed
  const handleGrantDevAdmin = async () => {
    if (!user) return;
    setCheckingRole(true);
    await setAdminRoleOverride(user.id, "admin");
    await verifyRole();
  };

  if (authLoading || checkingRole) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#0f1c16",
          color: "#e2ece7",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(46, 125, 91, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#34d399",
          }}
        >
          <PawPrint size={28} className="animate-spin-slow" />
        </div>
        <p style={{ fontSize: "1rem", fontWeight: 600, color: "#9bb8ab" }}>
          Verifying administrative privileges...
        </p>
      </div>
    );
  }

  if (!user) {
    // Preserve URL for return
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Not authorized screen
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f7f5",
          padding: 24,
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "#ffffff",
            borderRadius: 16,
            padding: 36,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            textAlign: "center",
            border: "1px solid #e3ebe6",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
            }}
          >
            <ShieldAlert size={36} />
          </div>

          <h2
            style={{
              fontSize: "1.45rem",
              fontWeight: 800,
              color: "#14221c",
              marginBottom: 10,
            }}
          >
            Access Denied
          </h2>

          <p
            style={{
              fontSize: "0.95rem",
              color: "#5f756b",
              lineHeight: 1.5,
              marginBottom: 26,
            }}
          >
            You do not have permission to view the PAWLIO Admin Console. This
            area is restricted strictly to accounts with the <strong>admin</strong> role.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link
              to="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 20px",
                background: "#2e7d5b",
                color: "#ffffff",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              <ArrowLeft size={18} />
              Return to User Dashboard
            </Link>

            {/* Development / Evaluator Admin unlock helper */}
            <button
              type="button"
              onClick={handleGrantDevAdmin}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 18px",
                background: "#f8faf9",
                border: "1px dashed #2e7d5b",
                color: "#2e7d5b",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.88rem",
              }}
            >
              <ShieldCheck size={18} />
              Promote My Account to Admin (Dev Testing)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
