/**
 * session.js — Centralized session management for RecruiterPro
 *
 * Design decisions:
 *  - Token stored in localStorage so it persists across tab/browser sessions.
 *  - Session only ends on explicit logout.
 *  - Inactivity timeout is effectively disabled (100 years).
 */

export const TOKEN_KEY        = 'hr_token'
export const LAST_ACTIVE_KEY  = 'hr_last_active'
export const INACTIVITY_MS    = 100 * 365 * 24 * 60 * 60 * 1000   // 100 years (disabled)
export const WARN_BEFORE_MS   = 0                                 // No warning modal

// ── Token I/O ─────────────────────────────────────────────────────────────

/**
 * Decode our backend token — plain base64-encoded JSON (not a 3-part JWT).
 * Falls back gracefully so a malformed token never crashes the app.
 */
function decode(token) {
  try {
    // Our backend uses pure base64(JSON), not a dotted JWT.
    // Never split on '.' — just decode the whole string.
    const padded = token.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

/** Save token to localStorage so it persists across tabs and refreshes. */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
  touchActivity()
}

/**
 * Read and validate the stored token.
 * Returns null ONLY if the token is truly missing or its exp timestamp
 * has already passed.  A token with no exp field is treated as valid.
 */
export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  const payload = decode(token)
  // If decode fails the token is corrupted — wipe it.
  if (!payload) { clearSession(); return null }
  // Only reject if exp is present AND already in the past.
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

/** Remove all session data from localStorage. */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(LAST_ACTIVE_KEY)
}

// ── Activity tracking ──────────────────────────────────────────────────────

/** Record user activity timestamp. */
export function touchActivity() {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
}

/** Return ms since last recorded activity (or Infinity if no record). */
export function msSinceLastActivity() {
  const last = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10)
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
