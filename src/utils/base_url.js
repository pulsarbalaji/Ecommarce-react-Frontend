// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/`,
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setupAxiosInterceptors = (logout) => {
  // Request interceptor
  api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("access");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Response interceptor for auto-refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refresh = sessionStorage.getItem("refresh");

        if (refresh) {
          try {
            const res = await axios.post(
              `${process.env.REACT_APP_API_URL}/api/token/refresh/`,
              { refresh }
            );
            const newAccess = res.data.access;

            // Store new token
            sessionStorage.setItem("access", newAccess);
            api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
            originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

            return api(originalRequest); // retry failed request
          } catch (err) {
            console.warn("⚠️ Refresh token expired — logging out");
            logout(); // logout from context
            window.location.href = "/login";
          }
        } else {
          logout();
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    }
  );
};

export default api;
