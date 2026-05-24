import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { resetPassword } from '../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.')
    }
  }, [token])

  const handleReset = async (e) => {
    e.preventDefault()
    if (!token) { setError('Missing reset token'); return }
    if (newPw.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPw !== confirmPw) { setError('Passwords do not match'); return }
    
    setLoading(true)
    setError('')
    
    try {
      await resetPassword({ token, new_password: newPw })
      setSuccess('Password updated! Redirecting to login…')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed. The token may have expired.')
    } finally { 
      setLoading(false) 
    }
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
            <h2>🔒 Set New Password</h2>
            <p className="auth-sub">Choose a new password for your account</p>

            {error && <div className="auth-error"><span>⚠️</span> {error}</div>}
            {success && <div className="auth-success"><span>✅</span> {success}</div>}

            {!success && token && (
              <form onSubmit={handleReset} className="auth-form">
                <div className="auth-field">
                  <label>New Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🔒</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      disabled={loading}
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="auth-field">
                  <label>Confirm Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🔒</span>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <span className="spinner"></span> : null}
                  {loading ? 'Updating…' : '🔐 Update Password'}
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
