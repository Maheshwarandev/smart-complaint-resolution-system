import { createContext, useState, useEffect } from "react";
import { getMeAPI } from "../api/authAPI";

// 1. Create the context object
export const AuthContext = createContext(null);

// 2. Create the Provider component — wraps the entire app
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true); // true while checking existing session

  // On app load, if a token exists in localStorage, fetch the user profile
  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const res = await getMeAPI();
          setUser(res.data.data);
        } catch {
          // Token invalid or expired — clear everything
          logout();
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  // Called after successful login or register
  const saveAuth = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user",  JSON.stringify(userData));
  };

  // Called on logout or 401 response
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
