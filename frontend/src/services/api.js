import axios from "axios";

const api = axios.create({
  baseURL: "https://job-intel-backend-m7bp.onrender.com/api",
});

export default api;