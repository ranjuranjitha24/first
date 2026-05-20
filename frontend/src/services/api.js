/**
 * api.js — Axios API client for RecruiterPro
 *
 * Key session-security additions:
 *  - getToken() reads from sessionStorage (auto-cleared on tab/browser close)
 *  - getCurrentUser() validates token expiry before returning payload
 *  - Response interceptor catches 401/403 and clears the session
 */
import axios from 'axios'
import { getToken, getSessionUser, clearSession } from './session'

const rawUrl  = import.meta.env.VITE_API_URL || ''
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`

const API = axios.create({ baseURL })

// ── Request: attach valid token ──────────────────────────────────────────
API.interceptors.request.use(cfg => {
  const token = getToken()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ── Response: auto-logout on 401 / 403 ───────────────────────────────────
API.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    if (status === 401 || status === 403) {
      clearSession()
      // Hard redirect — avoids needing navigate() here
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?reason=expired'
      }
    }
    return Promise.reject(err)
  }
)

// ── Helpers (kept for backward compatibility across the app) ──────────────
export const getCurrentUser = () => getSessionUser()

// ── AUTH ──────────────────────────────────────────────────────────────────
export const loginUser           = (data) => API.post('/auth/login', data)
export const registerUser        = (data) => API.post('/auth/register', data)
export const candidateRegister   = (data) => API.post('/auth/candidate/register', data)
export const candidateLogin      = (data) => API.post('/auth/candidate/login', data)
export const forgotPassword      = (data) => API.post('/auth/forgot-password', data)
export const resetPassword       = (data) => API.post('/auth/reset-password', data)

// ── EMPLOYEES ──
export const getEmployees    = (params)     => API.get('/employees/', { params })
export const getEmployeeById = (id)         => API.get(`/employees/${id}`)
export const addEmployee     = (data)       => API.post('/employees/', data)
export const updateEmployee  = (id, data)   => API.put(`/employees/${id}`, data)
export const deleteEmployee  = (id)         => API.delete(`/employees/${id}`)
export const getStats        = ()           => API.get('/employees/stats')

// ── INTERVIEWS ──
export const getInterviews         = (params)   => API.get('/interviews/', { params })
export const getUpcomingInterviews = ()         => API.get('/interviews/upcoming')
export const addInterview          = (data)     => API.post('/interviews/', data)
export const updateInterview       = (id, data) => API.put(`/interviews/${id}`, data)
export const deleteInterview       = (id)       => API.delete(`/interviews/${id}`)

// ── JOBS ──
export const getJobs   = (params)     => API.get('/jobs/', { params })
export const addJob    = (data)       => API.post('/jobs/', data)
export const updateJob = (id, data)   => API.put(`/jobs/${id}`, data)
export const deleteJob = (id)         => API.delete(`/jobs/${id}`)

// ── CANDIDATES ──
export const getCandidates    = (params)     => API.get('/candidates/', { params })
export const getPipelineStats = ()           => API.get('/candidates/stats')
export const addCandidate     = (data)       => API.post('/candidates/', data)
export const updateCandidate  = (id, data)   => API.put(`/candidates/${id}`, data)
export const deleteCandidate  = (id)         => API.delete(`/candidates/${id}`)

// ── LEAVES ──
export const getLeaves      = (params)     => API.get('/leaves/', { params })
export const getLeaveBalances = ()         => API.get('/leaves/balances')
export const getLeaveStats    = ()         => API.get('/leaves/stats')
export const addLeave         = (data)     => API.post('/leaves/', data)
export const updateLeave      = (id, data) => API.put(`/leaves/${id}`, data)
export const deleteLeave      = (id)       => API.delete(`/leaves/${id}`)

// ── REVIEWS ──
export const getReviews    = (params)     => API.get('/reviews/', { params })
export const getReviewStats = (params)   => API.get('/reviews/stats', { params })
export const addReview     = (data)      => API.post('/reviews/', data)
export const updateReview  = (id, data)  => API.put(`/reviews/${id}`, data)
export const deleteReview  = (id)        => API.delete(`/reviews/${id}`)

// ── ATTENDANCE ──
export const getAttendance      = (params) => API.get('/attendance/', { params })
export const getAttendanceStats = (params) => API.get('/attendance/stats', { params })
export const attendanceCheck    = (data)   => API.post('/attendance/check', data)

// ── PAYROLL ──
export const getPayroll      = (params)    => API.get('/payroll/', { params })
export const getPayrollStats = ()          => API.get('/payroll/stats')
export const addPayroll      = (data)      => API.post('/payroll/', data)
export const updatePayroll   = (id, data)  => API.put(`/payroll/${id}`, data)

// ── AI ASSISTANT ──
export const analyzeResume = (formData) => API.post('/ai/analyze', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// ── NOTIFICATIONS ──
export const getNotifications = ()     => API.get('/notifications/')
export const getUnreadCount   = ()     => API.get('/notifications/unread-count')
export const markRead         = (id)   => API.put(`/notifications/${id}/read`)
export const markAllRead      = ()     => API.put('/notifications/read-all')

// ── CANDIDATE PORTAL ──
export const getPortalStats          = ()      => API.get('/portal/stats')
export const getCandidateProfile     = ()      => API.get('/portal/profile')
export const updateCandidateProfile  = (data)  => API.put('/portal/profile', data)
export const getPortalNotifications  = ()      => API.get('/portal/notifications')
export const markPortalNotifRead     = (id)    => API.put(`/portal/notifications/${id}/read`)
export const getPortalJobs           = ()      => API.get('/portal/jobs')
export const applyForJob             = (data)  => API.post('/portal/apply', data)
export const getMyApplications       = ()      => API.get('/portal/my-applications')
export const getMyInterviews         = ()      => API.get('/portal/my-interviews')

// ── MEETINGS ──
export const getMeetings         = (params)    => API.get('/meetings/', { params })
export const getUpcomingMeetings = ()          => API.get('/meetings/upcoming')
export const addMeeting          = (data)      => API.post('/meetings/', data)
export const updateMeeting       = (id, data)  => API.put(`/meetings/${id}`, data)
export const deleteMeeting       = (id)        => API.delete(`/meetings/${id}`)
