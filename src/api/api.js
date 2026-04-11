import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

// refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

//
// REQUEST INTERCEPTOR
//
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

//
// RESPONSE INTERCEPTOR
//
API.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
	
	if (originalRequest.url.includes("/api/auth/refresh")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // queue requests
      return new Promise(function(resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
      .then((token) => {
        originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: "Bearer " + token
          };
        return API(originalRequest);
      })
      .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
	  
	  if (!refreshToken) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` }
        }
      );

	  const accessToken = response.data?.accessToken || response.data?.data?.accessToken;
	  if (!accessToken) {
		  throw new Error("Access token not found in response");
		}
      const isRemember = !!localStorage.getItem("refreshToken");

		if (isRemember) {
		  localStorage.setItem("accessToken", accessToken);
		} else {
		  sessionStorage.setItem("accessToken", accessToken);
		}
	  
      processQueue(null, accessToken);
      originalRequest.headers = {
		  ...originalRequest.headers,
		  Authorization: `Bearer ${accessToken}`
		};
      return API(originalRequest);
    } catch (err) {
      processQueue(err, null);
      // logout
	  localStorage.clear();
	  sessionStorage.clear();
	  window.location.href = "/login";
	  return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default API;