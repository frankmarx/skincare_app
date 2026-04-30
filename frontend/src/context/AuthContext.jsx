import { createContext, useContext, useState, useEffect } from "react";
import { loadStoredTokens, signOut, getUser } from "../api.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (loadStoredTokens()) {
        setIsAuthenticated(true);
        try {
          const userData = await getUser();
          setUser(userData);
        } catch (e) {
          console.error("Failed to load user data", e);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out failed", e);
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
