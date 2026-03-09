import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

const existingToken = localStorage.getItem("token");
if (existingToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
  API.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    config.headers.Authorization = `Bearer ${token}`;
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
    delete config.headers.Authorization;
    delete API.defaults.headers.common.Authorization;
  }

  return config;
});

export const getDashboardData = (data) => API.post("/dashboard", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getAdminAnalytics = () => API.get("/admin/analytics");
export const getAdminStudents = () => API.get("/admin/students");
export const getAdminStudentById = (id) => API.get(`/admin/student/${id}`);
export const addMentorReview = (id, note) => API.post(`/admin/review/${id}`, { note });

export default API;
