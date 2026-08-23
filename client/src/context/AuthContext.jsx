import { createContext, useState } from "react";
import { login as loginService, register as registerService } from "../services/authService";



export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);

    try {
      const result = await loginService(email, password);

      const { token, user } = result.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      return user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);

    try {
      const result = await registerService(data);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
  <AuthContext.Provider
    value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}
  >
    {children}
  </AuthContext.Provider>
);
};