import { useEffect } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4 pt-20">
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
}