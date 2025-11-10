import { useState } from "react";
import { useLocation } from "wouter";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSignupSuccess = async (userData: any) => {
    try {
      // Call signup API directly
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: userData.username,
          password: userData.password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar conta');
      }

      const result = await response.json();
      
      // Success - redirect to login
      navigate("/login");
    } catch (error) {
      console.error('Signup error:', error);
      // Handle error in SignupForm
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SignupForm onSuccess={handleSignupSuccess} />
    </div>
  );
}