import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("user")) || null
  );
  const [access, setAccess] = useState(sessionStorage.getItem("access") || null);
  const [refresh, setRefresh] = useState(sessionStorage.getItem("refresh") || null);

  const login = (data) => {
    sessionStorage.setItem("access", data.access);
    sessionStorage.setItem("refresh", data.refresh);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    setAccess(data.access);
    setRefresh(data.refresh);
    setUser(data.user);
  };

  const logout = () => {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    sessionStorage.removeItem("user");
    setAccess(null);
    setRefresh(null);
    setUser(null);
  };

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const storedAccess = sessionStorage.getItem("access");
    const storedRefresh = sessionStorage.getItem("refresh");
    if (storedUser) setUser(storedUser);
    if (storedAccess) setAccess(storedAccess);
    if (storedRefresh) setRefresh(storedRefresh);
  }, []);

  return (
    <AuthContext.Provider value={{ user, access, refresh, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook for easier usage
export const useAuth = () => useContext(AuthContext);
