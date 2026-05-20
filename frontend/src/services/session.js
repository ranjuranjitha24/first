/**
 * session.js — Centralized session management for RecruiterPro
 *
 * Design decisions:
 *  - Token lives purely in sessionStorage so it is automatically cleared when
 *    the tab or browser is closed.
 *  - Inactivity timeout is 30 minutes (configurable via INACTIVITY_MS).
 *  - Token expiry from the payload is always checked on read.
 */

export const TOKEN_KEY        = 'hr_token'
export const LAST_ACTIVE_KEY  = 'hr_last_active'
export const INACTIVITY_MS    = 30 * 60 * 1000   // 30 minutes
export const WARN_BEFORE_MS   = 2  * 60 * 1000   // warn 2 min before timeout

// ── Token I/O ─────────────────────────────────────────────────────────────

/** Decode base64 token payload without throwing. */
function decode(token) {
  try {
    let payload = token.split('.')[1] || token
    payload = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

/** Save token to sessionStorage (clears on tab/browser close). */
export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token)
  touchActivity()
}

/** Read token — returns null if missing, expired, or malformed. */
export function getToken() {
  const token = sessionStorage.getItem(TOKEN_KEY)
  if (!token) return null
  const payload = decode(token)
  if (!payload) { clearSession(); return null }
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    clearSession()
    return null
  }
  return token
}

/** Parse and return current user payload, or null. */
export function getSessionUser() {
  const token = getToken()
  if (!token) return null
  return decode(token)
}

/** Remove all session data. */
export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(LAST_ACTIVE_KEY)
}

// ── Activity tracking ──────────────────────────────────────────────────────

/** Record user activity timestamp. */
export function touchActivity() {
  sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
}

/** Return ms since last recorded activity (or Infinity if no record). */
export function msSinceLastActivity() {
  const last = parseInt(sessionStorage.getItem(LAST_ACTIVE_KEY) || '0', 10)
  return last ? Date.now() - last : Infinity
}

/** True if inactivity timeout has been exceeded. */
export function isInactive() {
  return msSinceLastActivity() >= INACTIVITY_MS
}

/** True if within the warning window before timeout. */
export function isNearTimeout() {
  const elapsed = msSinceLastActivity()
  return elapsed >= INACTIVITY_MS - WARN_BEFORE_MS && elapsed < INACTIVITY_MS
}

/** Ms remaining until forced logout (0 if already past). */
export function msUntilTimeout() {
  return Math.max(0, INACTIVITY_MS - msSinceLastActivity())
}
