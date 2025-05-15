'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user type
interface UserProfile {
  name?: string;
  wallet_address?: string;
  email: string;
  created_at: string;
  // Add other profile fields as needed
}

interface User {
  id: string;
  email: string;
  role: string; // Add role property
  profile: UserProfile | null;
}

// Define Auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string, name?: string, wallet_address?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => null,
  signup: async () => {},
  logout: async () => {},
  clearError: () => {},
  refreshUser: async () => {},
});

// Create custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<number>(0);

  // Function to check user session
  const checkUserSession = async () => {
    try {
      console.log("AuthContext: Checking user session...");
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        console.log("AuthContext: User session data:", data.user);
        setUser(data.user);
        setLastChecked(Date.now());
        return data.user;
      } else {
        console.log("AuthContext: No active session found");
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('AuthContext: Failed to fetch user session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    console.log("AuthContext: Refreshing user data");
    setLoading(true);
    
    try {
      // Add a cache-busting parameter
      const timestamp = Date.now();
      const response = await fetch(`/api/auth/me?_=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("AuthContext: Refresh successful, user data:", data.user);
        setUser(data.user);
        setLastChecked(Date.now());
        return data.user;
      } else {
        console.log("AuthContext: No active session found during refresh");
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('AuthContext: Failed to refresh user session:', err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    checkUserSession();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log("Login request initiated for:", email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log("Login successful, user data:", data.user);
      setUser(data.user);
      setLastChecked(Date.now());
      return data.user;
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name?: string, wallet_address?: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Signup request initiated for:", email);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, wallet_address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      console.log("Signup successful, user ID:", data.userId);
      
      // Auto login after signup
      await login(email, password);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Logout initiated");
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Logout failed');
      }

      console.log("Logout successful");
      setUser(null);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
