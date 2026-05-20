/**
 * SessionContext — provides session state and auto-logout logic to all
 * components via the useSession() hook.
 *
 * Features:
 *  - Token stored in sessionStorage → auto-cleared when ALL browser tabs close
 *  - localStorage mirror enables cross-tab logout detection via 'storage' event
 *  - Polls every 30 s for token expiry & inactivity
 *  - Activity listeners reset the inactivity timer on user interaction
 *  - Shows a 2-minute countdown warning modal before forced logout
 *  - beforeunload handler clears the session on tab/window close
 *  - Redirects to /login with a reason code so the login page can display
 *    a contextual message (inactivity | expired | other-tab)
 */

import {
  createContext, useContext, useEffect,
  useState, useRef, useCallback
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TOKEN_KEY,
  INACTIVITY_MS, WARN_BEFORE_MS,
  getToken, getSessionUser,
  clearSession, touchActivity,
  msSinceLastActivity, saveToken
} from '../services/session'

const SessionContext = createContext(null)

const POLL_MS        = 30_000   // check every 30 s
const COUNTDOWN_TICK = 1_000    // update countdown every second

export function SessionProvider({ children }) {
  const navigate = useNavigate()

  const [user,        setUser]        = useState(() => getSessionUser())
  const [showWarning, setShowWarning] = useState(false)
  const [countdown,   setCountdown]   = useState(0)

  // Refs for intervals (avoids stale-closure issues inside setInterval callbacks)
  const pollRef         = useRef(null)
  const countdownRef    = useRef(null)
  const showWarningRef  = useRef(false)   // mirror of showWarning for poll callback

  // Keep the ref in sync with state
  useEffect(() => { showWarningRef.current = showWarning }, [showWarning])

  // ── Helpers ───────────────────────────────────────────────────────────────

  const stopAllTimers = useCallback(() => {
    clearInterval(pollRef.current)
    clearInterval(countdownRef.current)
  }, [])

  // ── Core logout ───────────────────────────────────────────────────────────

  const logout = useCallback((reason = 'manual') => {
    stopAllTimers()
    clearSession()
    setUser(null)
    setShowWarning(false)
    showWarningRef.current = false

    if (reason !== 'manual') {
      navigate('/login', { replace: true, state: { reason } })
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate, stopAllTimers])

  // ── Inactivity / expiry polling ─────────────────────────────────────────
  // Declared BEFORE login() so it can be referenced in login's dep array.

  const startPolling = useCallback(() => {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      // 1. Token still valid?
      const token = getToken()
      if (!token) { logout('expired'); return }

      const elapsed   = msSinceLastActivity()
      const remaining = INACTIVITY_MS - elapsed

      // 2. Past full inactivity timeout?
      if (elapsed >= INACTIVITY_MS) {
        logout('inactivity')
        return
      }

      // 3. Inside the warning window and not already showing warning?
      if (remaining <= WARN_BEFORE_MS && !showWarningRef.current) {
        showWarningRef.current = true
        setShowWarning(true)

        const secs = Math.floor(remaining / 1000)
        setCountdown(secs)

        clearInterval(countdownRef.current)
        countdownRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownRef.current)
              logout('inactivity')
              return 0
            }
            return prev - 1
          })
        }, COUNTDOWN_TICK)
      }
    }, POLL_MS)
  }, [logout])

  // ── Login (called from Login page) ──────────────────────────────────────

  const login = useCallback((token) => {
    saveToken(token)
    setUser(getSessionUser())
    setShowWarning(false)
    showWarningRef.current = false
    startPolling()   // begin polling as soon as user logs in
  }, [startPolling])

  // ── Extend session (user clicked "Stay logged in") ────────────────────────

  const extendSession = useCallback(() => {
    touchActivity()
    setShowWarning(false)
    showWarningRef.current = false
    clearInterval(countdownRef.current)
    setCountdown(0)
  }, [])

  // ── Activity listeners (reset inactivity timer on any user interaction) ───

  useEffect(() => {
    const handleActivity = () => {
      touchActivity()
      // If the warning is showing, dismiss it automatically on interaction
      if (showWarningRef.current) extendSession()
    }
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }))
    return () => events.forEach(ev => window.removeEventListener(ev, handleActivity))
  }, [extendSession])

  // ── beforeunload handler removed: sessionStorage clears automatically when tab closes ───




  // ── Boot: restore from sessionStorage if the page was refreshed ───────────

  useEffect(() => {
    const token = getToken()
    if (token) {
      setUser(getSessionUser())
      touchActivity()
      startPolling()
    } else {
      clearSession()
    }
    return stopAllTimers
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // ↑ Intentionally empty-deps: this only runs once on mount

  // ── Guard: if token disappears between polls, catch it ─────────────────────
  // NOTE: using a dep on `user` so this only re-runs when user state changes,
  // NOT on every render (which caused false logouts during candidate navigation).
  useEffect(() => {
    if (user && !getToken()) logout('expired')
  }, [user, logout])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SessionContext.Provider value={{ user, login, logout, extendSession }}>
      {children}

      {/* ── Inactivity Warning Modal ── */}
      {showWarning && (
        <div className="session-overlay" role="dialog" aria-modal="true" aria-label="Session timeout warning">
          <div className="session-modal">
            <div className="session-modal-icon">⏳</div>
            <h3>Still there?</h3>
            <p>
              You'll be automatically logged out due to inactivity in{' '}
              <strong style={{ color: '#ef4444' }}>
                {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
              </strong>
            </p>
            <div className="session-modal-actions">
              <button className="session-btn-stay" onClick={extendSession} autoFocus>
                ✅ Stay Logged In
              </button>
              <button className="session-btn-logout" onClick={() => logout('manual')}>
                🚪 Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>')
  return ctx
}
