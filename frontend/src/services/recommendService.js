import axios from "axios";

export const getCareerRecommendations = (profile) => {
  return axios.post("http://localhost:5000/api/careers/recommend", profile);
};
