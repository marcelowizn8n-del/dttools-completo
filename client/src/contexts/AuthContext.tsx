import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface AuthState {
  user: Omit<User, "password"> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state by checking server session
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check server session first
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        
        if (response.ok) {
          // Verify response is JSON before parsing
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            console.warn("Auth check received non-JSON response, treating as unauthenticated");
            throw new Error("Non-JSON response from server");
          }
          
          const { user } = await response.json();
          // Sync localStorage with server session
          localStorage.setItem("auth_user", JSON.stringify(user));
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Server session invalid, clear localStorage
          localStorage.removeItem("auth_user");
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // On error, clear localStorage and set unauthenticated
        localStorage.removeItem("auth_user");
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiRequest("POST", "/api/auth/login", { username, password });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const { user } = await response.json();
      
      // Store user in localStorage
      localStorage.setItem("auth_user", JSON.stringify(user));
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    console.log("AuthContext: Starting logout...");
    try {
      // Call logout endpoint
      console.log("AuthContext: Calling logout API...");
      await apiRequest("POST", "/api/auth/logout");
      console.log("AuthContext: Logout API completed");
    } catch (error) {
      // Log error but continue with logout
      console.error("AuthContext: Logout API error (continuing anyway):", error);
    }

    console.log("AuthContext: Clearing local storage and state...");
    // Clear local storage and state immediately
    localStorage.removeItem("auth_user");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    console.log("AuthContext: Redirecting to home...");
    // Redirect to home page with full page reload to clear all state
    window.location.href = '/';
  };

  const refreshUser = async (): Promise<void> => {
    try {
      console.log("[AuthContext] Refreshing user data...");
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      
      if (response.ok) {
        const { user } = await response.json();
        console.log("[AuthContext] Received user data:", {
          id: user.id,
          username: user.username,
          hasProfilePicture: !!user.profilePicture,
          profilePictureSize: user.profilePicture?.length || 0
        });
        localStorage.setItem("auth_user", JSON.stringify(user));
        setState(prev => ({
          ...prev,
          user,
        }));
        console.log("[AuthContext] User state updated successfully");
      } else {
        console.error("[AuthContext] Failed to refresh user, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const isAdmin = state.user?.role === "admin";

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Protected Route component
interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  if (adminOnly && !isAdmin) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
          <Button onClick={() => setLocation('/')} className="mt-4">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}