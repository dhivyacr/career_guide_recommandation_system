import API from "./api";

export const getLearningPath = (missingSkills) => {
  return API.post("/learning/learning-path", { missingSkills });
};
