import axios from 'axios';

axios.defaults.withCredentials = true; // Enable sending cookies with requests

const axiosClient = axios.create({
  baseURL: 'http://localhost:9000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
