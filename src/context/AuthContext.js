import React, { createContext, useState, useEffect, useContext } from "react";
import { setupAxiosInterceptors } from "../utils/base_url";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("user")) || null
  );
  const [access, setAccess] = useState(sessionStorage.getItem("access") || null);
  const [refresh, setRefresh] = useState(sessionStorage.getItem("refresh") || null);

  // ✅ Logout handler
  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    setAccess(null);
    setRefresh(null);
  };

  // ✅ Login handler
  const login = (data) => {
    sessionStorage.setItem("access", data.access);
    sessionStorage.setItem("refresh", data.refresh);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    setAccess(data.access);
    setRefresh(data.refresh);
    setUser(data.user);

    // Set up auto logout based on token expiry
    setupRefreshExpiryWatcher(data.refresh);
  };

  // ✅ Define watcher outside useEffect so both login() and useEffect can use it
  const setupRefreshExpiryWatcher = (refreshToken) => {
    try {
      const { exp } = jwtDecode(refreshToken);
      const timeout = exp * 1000 - Date.now();
      if (timeout > 0) {
        setTimeout(() => {
          console.warn("⚠️ Refresh token expired, logging out automatically");
          toast.error("Session expired, please log in again.");
          logout();
          window.location.href = "/login";
        }, timeout);
      }
    } catch (err) {
      console.error("Failed to decode refresh token:", err);
    }
  };

  // ✅ On mount, restore session + attach interceptors
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const storedAccess = sessionStorage.getItem("access");
    const storedRefresh = sessionStorage.getItem("refresh");

    if (storedUser) setUser(storedUser);
    if (storedAccess) setAccess(storedAccess);
    if (storedRefresh) {
      setRefresh(storedRefresh);
      setupRefreshExpiryWatcher(storedRefresh);
    }

    // attach axios interceptors
    setupAxiosInterceptors(logout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, access, refresh, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
