import API from "./api";

export const saveStudentProfile = (data) => {
  return API.post("/student/profile", data);
};

export const getStudentProfile = () => {
  return API.get("/student/profile");
};
