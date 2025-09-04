
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export function getAuth() {
  const raw = localStorage.getItem('auth')
  return raw ? JSON.parse(raw) : null
}

export function setAuth(auth) {
  localStorage.setItem('auth', JSON.stringify(auth))
}

export function logout() {
  localStorage.removeItem('auth')
}

export const api = axios.create({
  baseURL: API_BASE + '/api',
})

api.interceptors.request.use((config) => {
  const auth = getAuth()
  if (auth?.token) {
    config.headers['Authorization'] = 'Bearer ' + auth.token
  }
  return config
})
