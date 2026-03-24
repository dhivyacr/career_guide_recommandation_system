import API from "./api";

export const getSkillGap = (profile) => {
  return API.post("/skills/skill-gap", profile);
};
