import axios from "axios";

const api = axios.create({
  // baseURL:"https://surveybackend-erv4.onrender.com/",
  // baseURL: "https://survey-api.kantipurride.com/",
  baseURL:"http://localhost:5000",
  withCredentials: true,
});

export default api;
