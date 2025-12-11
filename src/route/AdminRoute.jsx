import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function AdminRoute({ children }) {
  const { user, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || profileLoading) {
    return <p className="p-6">Loading...</p>;
  }

  // IZINKAN reset password (PENTING)
  if (location.pathname.startsWith("/reset-password")) {
    return children;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <p className="p-6">Loading profile...</p>;
  }

  if (profile.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const isInsideAdmin = location.pathname.startsWith("/admin");
  if (!isInsideAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}