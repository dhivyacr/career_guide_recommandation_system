import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export const getCareers = () => API.get("/career/list");

export const recommendCareer = (data) => API.post("/career/recommend", data);

export const getSkillGap = (data) => API.post("/career/skill-gap", data);

export const loginUser = (data) => API.post("/auth/login", data);

export const registerUser = (data) => API.post("/auth/register", data);

export default API;

/*
Example usage with basic error handling:

import { getCareers } from "../services/api";

async function loadCareers() {
  try {
    const response = await getCareers();
    console.log(response.data);
  } catch (error) {
    console.error("Failed to fetch careers:", error.response?.data || error.message);
  }
}
*/
