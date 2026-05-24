import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect }       from 'react'
import { SessionProvider, useSession } from './context/SessionContext'
import { getToken }        from './services/session'
import { Toaster }         from 'sonner'
import { AnimatePresence } from 'framer-motion'

import Sidebar          from './components/Sidebar'
import TopNav           from './components/TopNav'
import AIAssistant      from './components/AIAssistant'
import UpgradeModal     from './components/UpgradeModal'

import Dashboard        from './pages/Dashboard'
import Employees        from './pages/Employees'
import Interviews       from './pages/Interviews'
import Jobs             from './pages/Jobs'
import Candidates       from './pages/Candidates'
import Leaves           from './pages/Leaves'
import Meetings         from './pages/Meetings'
import Reviews          from './pages/Reviews'
import Analytics        from './pages/Analytics'
import Attendance       from './pages/Attendance'
import Profile          from './pages/Profile'
import Payroll          from './pages/Payroll'
import Notifications    from './pages/Notifications'
import CandidateDashboard from './pages/CandidateDashboard'
import Careers          from './pages/Careers'
import Login            from './pages/Login'
import Register         from './pages/Register'
import ForgotPassword   from './pages/ForgotPassword'
import LandingPage      from './pages/LandingPage'
import DemoRequests     from './pages/DemoRequests'

// ── Route Guards ──────────────────────────────────────────────────────────

/**
 * ProtectedRoute — blocks access if no valid (non-expired) token exists.
 * Re-evaluates on every render so expiry is caught immediately.
 */
function ProtectedRoute({ children }) {
  const token = getToken()                    // validates expiry
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

/**
 * RoleRoute — ensures the user's role matches the allowed list.
 * Falls back to the correct dashboard for the actual role.
 */
function RoleRoute({ roles, children }) {
  const { user } = useSession()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) {
    if (user.role === 'admin' || user.role === 'hr') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'employee')                    return <Navigate to="/employee/dashboard" replace />
    return <Navigate to="/candidate/dashboard" replace />
  }
  return children
}

/**
 * GuestRoute — prevents logged-in users from viewing public-only pages.
 */
function GuestRoute({ children }) {
  const token = getToken()
  const { user } = useSession()
  if (token && user) {
    if (user.role === 'admin' || user.role === 'hr') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'employee')                    return <Navigate to="/employee/dashboard" replace />
    return <Navigate to="/candidate/dashboard" replace />
  }
  return children
}

// ── Login page — shows session-expired/inactivity message if sent ─────────
function LoginPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const reason    = location.state?.reason || new URLSearchParams(location.search).get('reason')
  const { login } = useSession()
  return <Login reason={reason} onLogin={login} navigate={navigate} />
}

// ── Shell (authenticated layout) ─────────────────────────────────────────
function AppShell() {
  const location = useLocation()
  
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <TopNav />
        <AIAssistant />
        <UpgradeModal />
        
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Default redirect */}
            <Route path="/" element={<RoleRoute roles={['admin','hr']}><Navigate to="/admin/dashboard" replace /></RoleRoute>} />

            {/* Admin / HR */}
            <Route path="/admin/dashboard" element={<RoleRoute roles={['admin','hr']}><Dashboard /></RoleRoute>} />
            <Route path="/analytics"       element={<RoleRoute roles={['admin','hr']}><Analytics /></RoleRoute>} />
            <Route path="/employees"       element={<RoleRoute roles={['admin','hr']}><Employees /></RoleRoute>} />
            <Route path="/jobs"            element={<RoleRoute roles={['admin','hr']}><Jobs /></RoleRoute>} />
            <Route path="/candidates"      element={<RoleRoute roles={['admin','hr']}><Candidates /></RoleRoute>} />
            <Route path="/settings"        element={<RoleRoute roles={['admin','hr']}><Profile /></RoleRoute>} />
            <Route path="/admin/demo-requests" element={<RoleRoute roles={['admin','hr']}><DemoRequests /></RoleRoute>} />

            {/* Employee */}
            <Route path="/employee/dashboard" element={<RoleRoute roles={['employee']}><Dashboard /></RoleRoute>} />
            <Route path="/attendance"         element={<RoleRoute roles={['admin','hr','employee']}><Attendance /></RoleRoute>} />
            <Route path="/payroll"            element={<RoleRoute roles={['admin','hr','employee']}><Payroll /></RoleRoute>} />

            {/* Candidate */}
            <Route path="/candidate/dashboard" element={<RoleRoute roles={['candidate']}><CandidateDashboard /></RoleRoute>} />
            <Route path="/jobs/available"      element={<RoleRoute roles={['candidate']}><Careers /></RoleRoute>} />
            <Route path="/applications"        element={<RoleRoute roles={['candidate']}><CandidateDashboard /></RoleRoute>} />

            {/* Shared */}
            <Route path="/interviews"   element={<RoleRoute roles={['admin','hr','employee','candidate']}><Interviews /></RoleRoute>} />
            <Route path="/leaves"       element={<RoleRoute roles={['admin','hr','employee']}><Leaves /></RoleRoute>} />
            <Route path="/meetings"     element={<RoleRoute roles={['admin','hr','employee']}><Meetings /></RoleRoute>} />
            <Route path="/reviews"      element={<RoleRoute roles={['admin','hr','employee']}><Reviews /></RoleRoute>} />
            <Route path="/profile"      element={<RoleRoute roles={['admin','hr','employee','candidate']}><Profile /></RoleRoute>} />
            <Route path="/notifications" element={<RoleRoute roles={['admin','hr','employee','candidate']}><Notifications /></RoleRoute>} />

            <Route path="/dashboard"    element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────
function App() {
  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  return (
    <BrowserRouter>
      <Toaster richColors theme="dark" position="bottom-right" offset="24px" />
      <SessionProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register"        element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

          {/* /careers — public, but logged-in candidates go to /jobs/available */}
          <Route path="/careers" element={<GuestRoute><Careers /></GuestRoute>} />

          {/* All authenticated routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          } />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  )
}

export default App
