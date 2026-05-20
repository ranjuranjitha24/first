import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loginUser, candidateLogin } from '../services/api'

const REASON_MSG = {
  inactivity:  '⏱️ You were logged out due to inactivity. Please sign in again.',
  expired:     '🔒 Your session has expired. Please sign in again.',
  'other-tab': '🔒 You were logged out from another tab.',
}

/**
 * Login receives two props from App.jsx's <LoginPage> wrapper:
 *  - reason   : session-timeout reason string (optional)
 *  - onLogin  : SessionContext.login() callback — saves token + starts polling
 *  - navigate : injected from the wrapper so we can redirect after login
 */
export default function Login({ reason, onLogin, navigate }) {
  const [mode, setMode]       = useState('admin')
  const [form, setForm]       = useState({ identifier: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      let res
      if (mode === 'candidate') {
        res = await candidateLogin({ email: form.identifier, password: form.password })
      } else {
        res = await loginUser({ username: form.identifier, password: form.password })
      }

      const token = res.data.data.token

      // ── Hand the token to SessionContext (saves to sessionStorage + starts timers)
      if (onLogin) {
        onLogin(token)
      }

      // Decode role for redirect
      let role = 'admin'
      try {
        let payload = token.split('.')[1] || token;
        payload = payload.replace(/-/g, '+').replace(/_/g, '/');
        role = JSON.parse(atob(payload)).role;
      } catch { /* ok */ }

      if (role === 'admin' || role === 'hr')  navigate('/admin/dashboard')
      else if (role === 'employee')           navigate('/employee/dashboard')
      else if (role === 'candidate')          navigate('/candidate/dashboard')
      else                                    navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally { setLoading(false) }
  }

  const fillDemo = (u, p) => setForm({ identifier: u, password: p })

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="logo-icon" style={{ width: 64, height: 64, fontSize: 22 }}>HR</div>
          <h1>RecruiterPro</h1>
          <p>Your all-in-one HR &amp; Talent Platform</p>
        </div>
        <div className="auth-features">
          {['📊 Real-time Analytics', '👥 Employee Management', '📅 Interview Scheduling',
            '🎥 Meet Integration', '💼 Job Postings', '🔔 Smart Notifications'].map(f => (
            <div key={f} className="auth-feature-item">
              <span className="auth-feature-check">✓</span> {f}
            </div>
          ))}
        </div>
        <div className="auth-tagline">Trusted by 500+ HR teams worldwide</div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'admin' ? 'active' : ''}`}
              onClick={() => { setMode('admin'); setForm({ identifier: '', password: '' }); setError('') }}
            >🏢 Admin / Employee</button>
            <button
              className={`auth-tab ${mode === 'candidate' ? 'active' : ''}`}
              onClick={() => { setMode('candidate'); setForm({ identifier: '', password: '' }); setError('') }}
            >👤 Candidate</button>
          </div>

          <div className="auth-card-body">
            <h2>Welcome back 👋</h2>
            <p className="auth-sub">
              {mode === 'candidate'
                ? 'Sign in with your email to access the candidate portal'
                : 'Sign in with your username to access the HR dashboard'}
            </p>

            {/* Session-expired / inactivity reason banner */}
            {reason && REASON_MSG[reason] && (
              <div className="auth-session-banner">
                {REASON_MSG[reason]}
              </div>
            )}

            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label>{mode === 'candidate' ? 'Email Address' : 'Username'}</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">{mode === 'candidate' ? '✉️' : '👤'}</span>
                  <input
                    type={mode === 'candidate' ? 'email' : 'text'}
                    value={form.identifier}
                    onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                    placeholder={mode === 'candidate' ? 'you@example.com' : 'Enter username'}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Password</label>
                  {mode === 'candidate' && (
                    <Link to="/forgot-password" className="auth-link" style={{ fontSize: 12 }}>
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading && <span className="spinner"></span>}
                {loading ? 'Signing in…' : '🚀 Sign In'}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="demo-section">
              <p className="demo-label">DEMO ACCOUNTS</p>
              <div className="demo-buttons">
                {mode === 'admin' ? (
                  <>
                    <button className="demo-btn" onClick={() => fillDemo('admin', 'admin123')}>Admin</button>
                    <button className="demo-btn" onClick={() => fillDemo('user',  'user123')}>Employee</button>
                  </>
                ) : (
                  <button className="demo-btn" onClick={() => fillDemo('candidate@demo.com', 'candidate123')}>
                    Demo Candidate
                  </button>
                )}
              </div>
            </div>

            {mode === 'candidate' && (
              <p className="auth-switch">
                New here?{' '}
                <Link to="/register" className="auth-link">Create a candidate account →</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
