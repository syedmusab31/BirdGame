// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // update as needed
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;
