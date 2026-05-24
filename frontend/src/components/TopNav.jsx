import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, getPortalNotifications, getUnreadCount, markRead, markAllRead } from '../services/api'
import { useSession } from '../context/SessionContext'
import { Clock, Search, Bell, LogOut, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'

export default function TopNav() {
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
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
          if (latest.type === 'danger') toast.error(`${latest.title}: ${latest.message}`)
          else toast.success(`${latest.title}: ${latest.message}`)
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

  // Calculate remaining trial days
  let trialDaysLeft = null;
  if (user?.isDemoUser && user?.trialEndDate) {
    const end = new Date(user.trialEndDate);
    const now = new Date();
    trialDaysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="flex flex-col w-full">
      {/* SaaS Trial Banner */}
      {user?.isDemoUser && trialDaysLeft !== null && (
        <div className={`px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold ${trialDaysLeft <= 0 ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
          <Clock size={14} />
          {trialDaysLeft <= 0 
            ? 'Your trial has expired. Upgrade to restore access.'
            : `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left in your ${user.planType || 'Starter'} trial.`
          }
          <a href="/#contact" className="ml-2 underline text-white">Upgrade Now</a>
        </div>
      )}
      
      <nav className="top-nav w-full">
      <div className="search-bar">
        <span className="search-icon"><Search size={16} className="text-gray-400" /></span>
        <input type="text" placeholder="Search employees, jobs, documents…" />
      </div>

      <div className="nav-actions">
        {/* Notifications bell */}
        <div className="nav-icon-wrapper" ref={notifRef}>
          <button className="nav-icon-btn" onClick={() => setShowNotif(!showNotif)}>
            <Bell size={20} className="text-gray-300" />
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
                        {n.type === 'success' ? <CheckCircle2 size={16} /> : n.type === 'warning' ? <AlertTriangle size={16} /> : n.type === 'danger' ? <AlertCircle size={16} /> : <Info size={16} />}
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
    </div>
  )
}
