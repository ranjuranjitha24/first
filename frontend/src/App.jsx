import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Interviews from './pages/Interviews'
import Jobs from './pages/Jobs'
import Candidates from './pages/Candidates'
import Leaves from './pages/Leaves'
import Reviews from './pages/Reviews'
import Login from './pages/Login'
import Careers from './pages/Careers'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('hr_token')
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard"  element={<Dashboard />} />
                  <Route path="/employees"  element={<Employees />} />
                  <Route path="/interviews" element={<Interviews />} />
                  <Route path="/jobs"       element={<Jobs />} />
                  <Route path="/candidates" element={<Candidates />} />
                  <Route path="/leaves"     element={<Leaves />} />
                  <Route path="/reviews"    element={<Reviews />} />
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
