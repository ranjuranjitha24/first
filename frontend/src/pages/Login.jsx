import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loginUser, candidateLogin, setupPassword } from '../services/api'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper } from '../components/ui/PageWrapper'
import { Button } from '../components/ui/Button'

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

  // Force Password Change State
  const [isSettingUpPassword, setIsSettingUpPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  
  // Calculate Password Strength
  const calculateStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s += 25;
    if (/[A-Z]/.test(pw)) s += 25;
    if (/[0-9]/.test(pw)) s += 25;
    if (/[^A-Za-z0-9]/.test(pw)) s += 25;
    return s;
  }
  const strength = calculateStrength(newPassword);
  
  const getStrengthColor = () => {
    if (strength <= 25) return '#ef4444' // danger
    if (strength <= 50) return '#f59e0b' // warning
    if (strength <= 75) return '#3b82f6' // info
    return '#10b981' // success
  }

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

      const resData = res.data.data
      
      // If backend forces password change
      if (resData.forcePasswordChange) {
        setIsSettingUpPassword(true)
        setError('')
        return // Stop standard login flow
      }

      const token = resData.token

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

      // Check if they just finished setup to show a premium banner in dashboard
      const state = setupSuccess ? { state: { showWelcomeTrial: true, trialEndDate: resData.trialEndDate } } : {}

      if (role === 'admin' || role === 'hr')  navigate('/admin/dashboard', state)
      else if (role === 'employee')           navigate('/employee/dashboard', state)
      else if (role === 'candidate')          navigate('/candidate/dashboard', state)
      else                                    navigate('/dashboard', state)
      
      toast.success('Successfully logged in!')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid credentials. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const handleSetupPassword = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await setupPassword({
        username: form.identifier,
        temp_password: form.password,
        new_password: newPassword
      })
      setSetupSuccess(true)
      setIsSettingUpPassword(false)
      setForm({ identifier: form.identifier, password: '' }) // Clear temp password
      setNewPassword('')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update password. Ensure it meets complexity requirements.'
      setError(msg)
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const fillDemo = (u, p) => setForm({ identifier: u, password: p })

  return (
    <PageWrapper className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-left">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="auth-brand">
          <div className="logo-icon" style={{ width: 64, height: 64, fontSize: 22 }}>HR</div>
          <h1>RecruiterPro</h1>
          <p>Your all-in-one HR &amp; Talent Platform</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="auth-features">
          {['📊 Real-time Analytics', '👥 Employee Management', '📅 Interview Scheduling',
            '🎥 Meet Integration', '💼 Job Postings', '🔔 Smart Notifications'].map((f, i) => (
            <motion.div 
              key={f} 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="auth-feature-item"
            >
              <span className="auth-feature-check" style={{ color: 'var(--primary-light)', fontWeight: 'bold' }}>✓</span> {f}
            </motion.div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="auth-tagline">Trusted by 500+ HR teams worldwide</motion.div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ type: 'spring', damping: 20 }}
          className="auth-card"
        >
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
            <p className="auth-sub" style={{ marginBottom: 32 }}>
              {mode === 'candidate'
                ? 'Sign in with your email to access the candidate portal'
                : 'Sign in with your username to access the HR dashboard'}
            </p>

            {/* Session-expired / inactivity reason banner */}
            <AnimatePresence>
              {reason && REASON_MSG[reason] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="auth-session-banner" style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: 12, borderRadius: 12, marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
                  {REASON_MSG[reason]}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isSettingUpPassword ? (
                <motion.form key="setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSetupPassword} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group" style={{ gap: 4 }}>
                    <label>Create Your Secure Password</label>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
                      Must be at least 8 characters and include uppercase, lowercase, number, and special character.
                    </p>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: 14, opacity: 0.5 }}>🛡️</span>
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="e.g., HR@Recruit2026!"
                        style={{ paddingLeft: 40, width: '100%' }}
                        required
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: 14, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
                        {showPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    <div style={{ display: 'flex', gap: 4, height: 4 }}>
                      {[1, 2, 3, 4].map(idx => (
                        <div key={idx} style={{ flex: 1, borderRadius: 2, background: strength >= idx * 25 ? getStrengthColor() : 'var(--border)', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: getStrengthColor() }}>
                      {strength === 0 ? 'Enter password' : strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong'}
                    </span>
                  </div>

                  <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
                    Secure Account & Continue
                  </Button>
                </motion.form>
              ) : (
                <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="form-group">
                    <label>{mode === 'candidate' ? 'Email Address' : 'Username'}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: 14, opacity: 0.5 }}>{mode === 'candidate' ? '✉️' : '👤'}</span>
                      <input
                        type={mode === 'candidate' ? 'email' : 'text'}
                        value={form.identifier}
                        onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                        placeholder={mode === 'candidate' ? 'you@example.com' : 'Enter username'}
                        autoComplete="username"
                        style={{ paddingLeft: 40, width: '100%' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label>Password</label>
                      {mode === 'candidate' && (
                        <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: 14, opacity: 0.5 }}>🔒</span>
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        style={{ paddingLeft: 40, width: '100%' }}
                        required
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: 14, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
                        {showPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 4, padding: 14, fontSize: 14 }}>
                    Sign In
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

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
        </motion.div>
      </div>
    </PageWrapper>
  )
}
