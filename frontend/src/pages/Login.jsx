import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'

export default function Login() {
  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await loginUser(form)
      localStorage.setItem('hr_token', res.data.data.token)
      navigate('/dashboard')
    } catch(err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="logo-icon" style={{width:60,height:60,fontSize:20}}>HR</div>
          <h1>RecruiterPro</h1>
          <p>Your all-in-one HR Management System</p>
        </div>
        <div className="login-features">
          {['📊 Dashboard & Analytics','👥 Employee Management','📅 Interview Scheduling',
            '🎥 Google Meet / Zoom Integration','💼 Job Postings & Candidates','🌴 Leave Tracker'].map(f=>(
            <div key={f} className="login-feature-item">{f}</div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Welcome back 👋</h2>
          <p className="login-sub">Sign in to your HR dashboard</p>

          {error && <div className="form-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))}
                placeholder="Enter username" required />
            </div>
            <div className="form-group" style={{marginTop:16}}>
              <label>Password</label>
              <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                placeholder="Enter password" required />
            </div>
            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          <div className="login-hint">
            <span>Enter any username and password to sign in</span>
          </div>
        </div>
      </div>
    </div>
  )
}
