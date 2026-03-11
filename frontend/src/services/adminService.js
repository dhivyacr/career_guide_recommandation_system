import API from "./api";

export const getAdminAnalytics = () => {
  return API.get("/admin/analytics");
};

export const getStudents = () => {
  return API.get("/students");
};

export const getStudentByRegisterNumber = (registerNumber) => {
  return API.get(`/student/${registerNumber}`);
};

export const saveAdminGuidance = (registerNumber, adminGuidance) => {
  return API.put(`/admin/guidance/${registerNumber}`, { adminGuidance });
};

export const addMentorGuidance = (studentId, message) => {
  return API.post(`/admin/guidance/${studentId}`, { message });
};
