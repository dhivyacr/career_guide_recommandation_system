import API from "./api";

export const getCareerRecommendations = (profile) => {
  return API.post("/careers/recommend", profile);
};

export const getCareerDetails = (registerNumber) => {
  return API.get(`/career/${registerNumber}`);
};
