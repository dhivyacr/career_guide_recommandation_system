import axios from "axios";

export const saveStudentProfile = (data) => {
  return axios.post("http://localhost:5000/api/student/profile", data);
};

export const getStudentProfile = (regNo) => {
  return axios.get("http://localhost:5000/api/student/profile", {
    params: { regNo }
  });
};
