import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { candidateRegister } from '../services/api'

export default function Register() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '', phone: '', resume: ''
  })
  const [showPw, setShowPw]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [loading, setLoading]       = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    if (!form.full_name.trim())                 return 'Full name is required'
    if (!/\S+@\S+\.\S+/.test(form.email))      return 'Enter a valid email address'
    if (form.password.length < 6)               return 'Password must be at least 6 characters'
    if (form.password !== form.confirm_password) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setLoading(true); setError('')

    try {
      await candidateRegister({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        resume: form.resume
      })
      setSuccess('🎉 Account created successfully! Redirecting to login…')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return { label: '', color: '' }
    if (p.length < 6) return { label: 'Weak', color: '#ef4444' }
    if (p.length < 10 || !/[A-Z]/.test(p)) return { label: 'Fair', color: '#f59e0b' }
    return { label: 'Strong', color: '#10b981' }
  })()

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="logo-icon" style={{ width: 64, height: 64, fontSize: 22 }}>HR</div>
          <h1>RecruiterPro</h1>
          <p>Join thousands of candidates finding their dream jobs</p>
        </div>
        <div className="auth-features">
          {['🚀 Apply to top companies', '📊 Track application status', '🗓️ Manage interviews',
            '🔔 Get real-time notifications', '👤 Build your profile', '💼 Explore open roles'].map(f => (
            <div key={f} className="auth-feature-item">
              <span className="auth-feature-check">✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-body">
            <h2>Create Your Account ✨</h2>
            <p className="auth-sub">Register as a candidate to explore and apply for jobs</p>

            {error   && <div className="auth-error"><span>⚠️</span> {error}</div>}
            {success && <div className="auth-success"><span>✅</span> {success}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label>Full Name *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Email Address *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉️</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="jane@example.com"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Phone Number</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📱</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Password *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && (
                  <div className="pw-strength">
                    <div className="pw-strength-bar" style={{ background: strength.color, width: strength.label === 'Weak' ? '33%' : strength.label === 'Fair' ? '66%' : '100%' }}></div>
                    <span style={{ color: strength.color, fontSize: 11, fontWeight: 700 }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label>Confirm Password *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm_password}
                    onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
                    placeholder="Re-enter password"
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label>Resume Link <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📎</span>
                  <input
                    type="text"
                    value={form.resume}
                    onChange={e => setForm(f => ({ ...f, resume: e.target.value }))}
                    placeholder="e.g., https://drive.google.com/..."
                  />
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Accepts Google Drive, Dropbox, or public PDF links.
                </p>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? <span className="spinner"></span> : null}
                {loading ? 'Creating account…' : '🚀 Create Account'}
              </button>
            </form>

            <p className="auth-switch" style={{ marginTop: 24 }}>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
