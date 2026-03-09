import axios from "axios";

export const getSkillGap = (profile) => {
  return axios.post("http://localhost:5000/api/skills/skill-gap", profile);
};
