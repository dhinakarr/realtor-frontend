import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 or 403 and ensure we haven't already tried to retry
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        // 1. Send the Refresh Token to the server
        // Note: Check if your API wants this in headers or as a query param (?token=...)
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
          headers: {
            // Some APIs use 'Authorization' or 'x-refresh-token'
            'Authorization': `Bearer ${refreshToken}` 
          }
        });

        // 2. Save the new Access Token received from server
        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);

        // 3. Update the original request with the NEW token and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest); 

      } catch (refreshError) {
        // 4. If refresh fails (e.g., refresh token also expired), force logout
        console.error("Session expired. Please login again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
