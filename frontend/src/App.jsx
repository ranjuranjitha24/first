import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentUser } from './services/api'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import AIAssistant from './components/AIAssistant'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Interviews from './pages/Interviews'
import Jobs from './pages/Jobs'
import Candidates from './pages/Candidates'
import Leaves from './pages/Leaves'
import Reviews from './pages/Reviews'
import Login from './pages/Login'
import Careers from './pages/Careers'
import Analytics from './pages/Analytics'
import Attendance from './pages/Attendance'
import Profile from './pages/Profile'
import Payroll from './pages/Payroll'
import CandidateDashboard from './pages/CandidateDashboard'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('hr_token')
  return token ? children : <Navigate to="/login" replace />
}

function RoleRoute({ roles, children }) {
  const user = getCurrentUser()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) {
    if (user.role === 'admin' || user.role === 'hr') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'employee') return <Navigate to="/employee/dashboard" replace />
    return <Navigate to="/candidate/dashboard" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/careers" element={getCurrentUser() ? <Navigate to="/jobs/available" replace /> : <Careers />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <TopNav />
                <AIAssistant />
                <Routes>
                  <Route path="/" element={<RoleRoute roles={['admin','hr']}><Navigate to="/admin/dashboard" replace /></RoleRoute>} />
                  
                  {/* Admin / HR Routes */}
                  <Route path="/admin/dashboard" element={<RoleRoute roles={['admin','hr']}><Dashboard /></RoleRoute>} />
                  <Route path="/analytics"  element={<RoleRoute roles={['admin','hr']}><Analytics /></RoleRoute>} />
                  <Route path="/employees"  element={<RoleRoute roles={['admin','hr']}><Employees /></RoleRoute>} />
                  <Route path="/jobs"       element={<RoleRoute roles={['admin','hr']}><Jobs /></RoleRoute>} />
                  <Route path="/candidates" element={<RoleRoute roles={['admin','hr']}><Candidates /></RoleRoute>} />
                  <Route path="/settings"   element={<RoleRoute roles={['admin','hr']}><Profile /></RoleRoute>} />
                  
                  {/* Employee Routes */}
                  <Route path="/employee/dashboard" element={<RoleRoute roles={['employee']}><Dashboard /></RoleRoute>} />
                  <Route path="/attendance" element={<RoleRoute roles={['admin','hr','employee']}><Attendance /></RoleRoute>} />
                  <Route path="/payroll"    element={<RoleRoute roles={['admin','hr','employee']}><Payroll /></RoleRoute>} />
                  
                  {/* Candidate Routes */}
                  <Route path="/candidate/dashboard" element={<RoleRoute roles={['candidate']}><CandidateDashboard /></RoleRoute>} />
                  <Route path="/jobs/available"      element={<RoleRoute roles={['candidate']}><Careers /></RoleRoute>} />
                  <Route path="/applications"        element={<RoleRoute roles={['candidate']}><CandidateDashboard /></RoleRoute>} />

                  
                  {/* Shared Routes */}
                  <Route path="/interviews" element={<RoleRoute roles={['admin','hr','employee','candidate']}><Interviews /></RoleRoute>} />
                  <Route path="/leaves"     element={<RoleRoute roles={['admin','hr','employee']}><Leaves /></RoleRoute>} />
                  <Route path="/reviews"    element={<RoleRoute roles={['admin','hr','employee']}><Reviews /></RoleRoute>} />
                  <Route path="/profile"    element={<RoleRoute roles={['admin','hr','employee','candidate']}><Profile /></RoleRoute>} />
                  
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
