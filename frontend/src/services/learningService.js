import axios from "axios";

export const getLearningPath = (missingSkills) => {
  return axios.post("http://localhost:5000/api/learning/learning-path", { missingSkills });
};
