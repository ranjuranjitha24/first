import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, getPortalNotifications, getUnreadCount, markRead, markAllRead } from '../services/api'
import { useSession } from '../context/SessionContext'

export default function TopNav() {
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })
  const notifRef = useRef(null)
  const navigate = useNavigate()

  // ── Session data from context ──────────────────────────────────────────
  const { user, logout } = useSession()

  // ── Notifications ──────────────────────────────────────────────────────
  const fetchNotifs = async () => {
    if (!user) return   // skip if session already cleared
    try {
      const isCandidate = user.role === 'candidate'
      const [notifRes, countRes] = await Promise.all([
        isCandidate ? getPortalNotifications() : getNotifications(),
        isCandidate ? Promise.resolve({ data: { count: 0 } }) : getUnreadCount()
      ])

      const newCount = countRes.data.count
      if (newCount > unreadCount && unreadCount !== 0) {
        const latest = notifRes.data.data?.[0]
        if (latest) {
          setToast({
            show: true,
            msg: `🔔 ${latest.title}: ${latest.message}`,
            type: latest.type === 'danger' ? 'danger' : 'success'
          })
          setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 5000)
        }
      }

      setNotifications(notifRes.data.data ?? [])
      setUnreadCount(newCount)
    } catch {
      // Silently ignore — 401 will be handled by the axios interceptor
    }
  }

  useEffect(() => {
    fetchNotifs()
    const id = setInterval(fetchNotifs, 10_000)
    return () => clearInterval(id)
  }, [user?.username]) // restart when user changes

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkRead = async (id) => {
    try { await markRead(id); fetchNotifs() } catch { /* ignore */ }
  }

  const handleMarkAllRead = async () => {
    try { await markAllRead(); fetchNotifs() } catch { /* ignore */ }
  }

  const displayName = user?.full_name || user?.username || 'HR Admin'
  const initial     = displayName.charAt(0).toUpperCase()

  return (
    <nav className="top-nav">
      {/* Toast notification popup */}
      {toast.show && (
        <div
          className={`toast show ${toast.type}`}
          style={{ position: 'fixed', top: 80, right: 24, zIndex: 10002, maxWidth: 400 }}
        >
          {toast.msg}
        </div>
      )}

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search employees, jobs, documents…" />
      </div>

      <div className="nav-actions">
        {/* Notifications bell */}
        <div className="nav-icon-wrapper" ref={notifRef}>
          <button className="nav-icon-btn" onClick={() => setShowNotif(!showNotif)}>
            🔔
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h3>Notifications</h3>
                <button className="mark-all-btn" onClick={handleMarkAllRead}>Mark all read</button>
              </div>
              <div className="notif-body">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      className={`notif-item ${n.is_read || n.read ? '' : 'unread'} ${n.type}`}
                      onClick={() => handleMarkRead(n._id)}
                    >
                      <div className="notif-icon-circle">
                        {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : n.type === 'danger' ? '🚨' : 'ℹ️'}
                      </div>
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-time">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {!(n.is_read || n.read) && <div className="unread-dot"></div>}
                    </div>
                  ))
                )}
              </div>
              <div className="notif-footer">
                <button onClick={() => { setShowNotif(false); navigate('/notifications') }}>
                  View all history
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Session logout shortcut */}
        <button
          className="nav-icon-btn"
          title="Logout"
          onClick={() => logout('manual')}
        >
          🚪
        </button>

        {/* Profile trigger */}
        <div className="profile-trigger" onClick={() => navigate('/profile')}>
          <div className="nav-user-info">
            <span className="nav-user-name">{displayName}</span>
            <span className="nav-user-role">{user?.role?.toUpperCase() || 'USER'}</span>
          </div>
          <div className="user-avatar">{initial}</div>
        </div>
      </div>
    </nav>
  )
}
