import axios from 'axios'

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

// Attach token to every request
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('hr_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const getCurrentUser = () => {
  const token = localStorage.getItem('hr_token')
  if (!token) return null
  try {
    return JSON.parse(atob(token))
  } catch (e) {
    return null
  }
}

// ── AUTH ──
export const loginUser    = (data) => API.post('/auth/login', data)
export const registerUser = (data) => API.post('/auth/register', data)

// ── EMPLOYEES ──
export const getEmployees    = (params) => API.get('/employees/', { params })
export const getEmployeeById = (id)     => API.get(`/employees/${id}`)
export const addEmployee     = (data)   => API.post('/employees/', data)
export const updateEmployee  = (id, data) => API.put(`/employees/${id}`, data)
export const deleteEmployee  = (id)     => API.delete(`/employees/${id}`)
export const getStats        = ()       => API.get('/employees/stats')

// ── INTERVIEWS ──
export const getInterviews        = (params) => API.get('/interviews/', { params })
export const getUpcomingInterviews = ()      => API.get('/interviews/upcoming')
export const addInterview          = (data)  => API.post('/interviews/', data)
export const updateInterview       = (id, data) => API.put(`/interviews/${id}`, data)
export const deleteInterview       = (id)    => API.delete(`/interviews/${id}`)

// ── JOBS ──
export const getJobs    = (params) => API.get('/jobs/', { params })
export const addJob     = (data)   => API.post('/jobs/', data)
export const updateJob  = (id, data) => API.put(`/jobs/${id}`, data)
export const deleteJob  = (id)     => API.delete(`/jobs/${id}`)

// ── CANDIDATES ──
export const getCandidates    = (params) => API.get('/candidates/', { params })
export const getPipelineStats = ()       => API.get('/candidates/stats')
export const addCandidate     = (data)   => API.post('/candidates/', data)
export const updateCandidate  = (id, data) => API.put(`/candidates/${id}`, data)
export const deleteCandidate  = (id)     => API.delete(`/candidates/${id}`)

// ── LEAVES ──
export const getLeaves    = (params) => API.get('/leaves/', { params })
export const addLeave     = (data)   => API.post('/leaves/', data)
export const updateLeave  = (id, data) => API.put(`/leaves/${id}`, data)
export const deleteLeave  = (id)     => API.delete(`/leaves/${id}`)

// ── REVIEWS ──
export const getReviews   = (params) => API.get('/reviews/', { params })
export const addReview    = (data)   => API.post('/reviews/', data)
export const updateReview = (id, data) => API.put(`/reviews/${id}`, data)
export const deleteReview = (id)     => API.delete(`/reviews/${id}`)
