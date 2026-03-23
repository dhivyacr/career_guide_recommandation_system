import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

const existingToken = localStorage.getItem("token");
if (existingToken) {
  API.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
    delete API.defaults.headers.common.Authorization;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("studentProfile");

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export const getDashboardData = () => API.get("/dashboard");
export const updateWeeklyGoal = (goalId, completed) => API.put(`/dashboard/weekly-goals/${goalId}`, { completed });
export const getReadinessReport = (userId) => API.get(`/readiness/${userId}`);
export const loginUser = (data) => API.post("/auth/login", data);
export const getAdminAnalytics = () => API.get("/admin/analytics");
export const getAdminStudents = () => API.get("/admin/students");
export const getAdminStudentById = (id) => API.get(`/admin/student/${id}`);
export const addMentorReview = (id, note) => API.post(`/admin/review/${id}`, { note });

export default API;
