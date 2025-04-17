import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5247/api', // Base URL for the backend API
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api 