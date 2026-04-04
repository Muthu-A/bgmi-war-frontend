// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5050/api",
// });

// export default API;

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5050/api",
});

// ✅ Attach seasonId automatically
API.interceptors.request.use((config) => {
  const season = JSON.parse(localStorage.getItem("season"));

  if (season?._id) {
    config.params = {
      ...config.params,
      seasonId: season._id,
    };
  }

  return config;
});

export default API;