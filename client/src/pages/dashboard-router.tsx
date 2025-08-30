import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Dashboard from "./dashboard";
import PartnerDashboard from "./partner-dashboard";
import AdminDashboard from "./admin-dashboard";

export default function DashboardRouter() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Route to appropriate dashboard based on user role
  if (user.role === "admin") {
    return <AdminDashboard />;
  } else if (user.role === "partner") {
    return <PartnerDashboard />;
  } else {
    return <Dashboard />;
  }
}