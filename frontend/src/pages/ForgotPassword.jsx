import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { forgotPassword, resetPassword } from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleRequest = async (e) => {
    e.preventDefault()
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return }
    setLoading(true); setError('')
    try {
      await forgotPassword({ email })
      setSuccess('If an account exists, a reset link has been sent to your email.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="logo-icon" style={{ width: 64, height: 64, fontSize: 22 }}>HR</div>
          <h1>RecruiterPro</h1>
          <p>Secure password recovery</p>
        </div>
        <div className="auth-features">
          {['🔐 Secure token-based reset', '⏱️ Tokens expire in 1 hour',
            '🔒 Passwords are hashed securely', '✉️ Email-based verification'].map(f => (
            <div key={f} className="auth-feature-item">
              <span className="auth-feature-check">✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-body">
            <h2>🔑 Forgot Password?</h2>
            <p className="auth-sub">
              Enter your registered email to receive a reset token
            </p>

            {error   && <div className="auth-error"><span>⚠️</span> {error}</div>}
            {success && <div className="auth-success"><span>✅</span> {success}</div>}

            {!success && (
              <form onSubmit={handleRequest} className="auth-form">
                <div className="auth-field">
                  <label>Email Address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">✉️</span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <span className="spinner"></span> : null}
                  {loading ? 'Sending…' : '📨 Send Reset Link'}
                </button>
              </form>
            )}

            <p className="auth-switch" style={{ marginTop: 24 }}>
              <Link to="/login" className="auth-link">← Back to login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
