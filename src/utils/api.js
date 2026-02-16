import axios from "axios";

const api = axios.create({
  // You must specify 'baseURL' as the key
  baseURL: "https://survey2-1-jjdd.onrender.com",
  // baseURL:'http://localhost:5000',
  // baseURL: "https://survey-api.kantipurride.com/",
  
  withCredentials: true
});

export default api;