import API from "./api";

export const getAdminAnalytics = () => {
  return API.get("/admin/analytics");
};

export const getStudents = () => {
  return API.get("/admin/students");
};
