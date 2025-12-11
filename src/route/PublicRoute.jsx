import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function PublicRoute({ children }) {
  const { user, profile, loading, profileLoading } = useAuth();

  if (loading || profileLoading) return <p className="p-6">Loading...</p>;

  // Jika sedang recovery, biarkan user akses halaman /reset-password
  if (localStorage.getItem("reset-mode") === "active") {
    return children;
  }

  if (user && profile?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user && profile?.role === "user") {
    return <Navigate to="/" replace />;
  }

  return children;
}