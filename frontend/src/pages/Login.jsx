import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loginUser, candidateLogin, setupPassword } from '../services/api'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { KeyRound, Mail, User } from 'lucide-react'

const REASON_MSG = {
  inactivity:  '⏱️ You were logged out due to inactivity. Please sign in again.',
  expired:     '🔒 Your session has expired. Please sign in again.',
  'other-tab': '🔒 You were logged out from another tab.',
}

export default function Login({ reason, onLogin, navigate }) {
  const [mode, setMode]       = useState('admin')
  const [form, setForm]       = useState({ identifier: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const [isSettingUpPassword, setIsSettingUpPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [setupSuccess, setSetupSuccess] = useState(false)
  
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
    if (strength <= 25) return '#ef4444' 
    if (strength <= 50) return '#f59e0b' 
    if (strength <= 75) return '#0ea5e9' 
    return '#10b981' 
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
      
      if (resData.forcePasswordChange) {
        setIsSettingUpPassword(true)
        setError('')
        return 
      }

      const token = resData.token

      if (onLogin) {
        onLogin(token)
      }

      let role = 'admin'
      try {
        let payload = token.split('.')[1] || token;
        payload = payload.replace(/-/g, '+').replace(/_/g, '/');
        role = JSON.parse(atob(payload)).role;
      } catch { /* ok */ }

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
      setForm({ identifier: form.identifier, password: '' }) 
      setNewPassword('')
      toast.success('Password updated successfully. Please log in.')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update password. Ensure it meets complexity requirements.'
      setError(msg)
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const fillDemo = (u, p) => setForm({ identifier: u, password: p })

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1020] relative px-4 selection:bg-cyan-500/30 font-sans">
      
      {/* Minimal Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[0%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] bg-cyan-900/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-sm mb-4">
            <span className="font-bold text-sm text-white">HR</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RecruiterPro</h1>
          <p className="text-sm text-slate-400 mt-1">Enterprise workforce platform</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-soft overflow-hidden">
          
          <div className="flex border-b border-slate-800">
            <button
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${mode === 'admin' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/30' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => { setMode('admin'); setForm({ identifier: '', password: '' }); setError('') }}
            >
              Workspace
            </button>
            <button
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${mode === 'candidate' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/30' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => { setMode('candidate'); setForm({ identifier: '', password: '' }); setError('') }}
            >
              Candidate
            </button>
          </div>

          <div className="p-8">
            <AnimatePresence>
              {reason && REASON_MSG[reason] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs px-4 py-3 rounded-lg mb-6 font-medium">
                  {REASON_MSG[reason]}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isSettingUpPassword ? (
                <motion.form key="setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSetupPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Create Secure Password</label>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                      Must be at least 8 characters and include uppercase, lowercase, number, and special character.
                    </p>
                    <div className="relative flex items-center">
                      <KeyRound size={16} className="absolute left-3 text-slate-500" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="e.g., HR@Recruit2026!"
                        required
                        className="w-full bg-[#0B1020] border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors"
                      />
                      <button type="button" className="absolute right-3 text-slate-500 hover:text-slate-300" onClick={() => setShowPw(!showPw)}>
                        {showPw ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="flex-1 rounded-full transition-colors duration-300" style={{ background: strength >= idx * 25 ? getStrengthColor() : '#1e293b' }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: getStrengthColor() }}>
                      {strength === 0 ? 'Enter password' : strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong'}
                    </span>
                  </div>

                  <Button type="submit" loading={loading} className="w-full mt-4 bg-white text-slate-950 hover:bg-slate-200 transition-colors py-2.5 rounded-lg font-semibold text-sm">
                    Secure Account
                  </Button>
                </motion.form>
              ) : (
                <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">{mode === 'candidate' ? 'Email Address' : 'Username'}</label>
                    <div className="relative flex items-center">
                      {mode === 'candidate' ? <Mail size={16} className="absolute left-3 text-slate-500" /> : <User size={16} className="absolute left-3 text-slate-500" />}
                      <input
                        type={mode === 'candidate' ? 'email' : 'text'}
                        value={form.identifier}
                        onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                        placeholder={mode === 'candidate' ? 'you@example.com' : 'Enter username'}
                        autoComplete="username"
                        required
                        className="w-full bg-[#0B1020] border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-300">Password</label>
                      {mode === 'candidate' && (
                        <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <KeyRound size={16} className="absolute left-3 text-slate-500" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        required
                        className="w-full bg-[#0B1020] border border-slate-700 rounded-lg pl-10 pr-12 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors"
                      />
                      <button type="button" className="absolute right-3 text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-colors" onClick={() => setShowPw(!showPw)}>
                        {showPw ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" loading={loading} className="w-full mt-4 bg-white text-slate-950 hover:bg-slate-200 transition-colors py-2.5 rounded-lg font-semibold text-sm">
                    Sign In
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Demo Helpers */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mb-3 text-center">Demo Access</p>
              <div className="flex justify-center gap-2">
                {mode === 'admin' ? (
                  <>
                    <button type="button" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors" onClick={() => fillDemo('admin', 'admin123')}>Admin</button>
                    <button type="button" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors" onClick={() => fillDemo('user',  'user123')}>Employee</button>
                  </>
                ) : (
                  <button type="button" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors" onClick={() => fillDemo('candidate@demo.com', 'candidate123')}>Candidate Demo</button>
                )}
              </div>
            </div>

            {mode === 'candidate' && (
              <div className="mt-6 text-center">
                <span className="text-xs text-slate-500">New here? </span>
                <Link to="/register" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  Create an account
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
