// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true, // send the HttpOnly auth_token cookie on every request
})

export default api
