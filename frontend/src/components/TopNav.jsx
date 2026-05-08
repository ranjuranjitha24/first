import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, getUnreadCount, markRead, markAllRead, getCurrentUser } from '../services/api'

export default function TopNav() {
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef(null)
  const navigate = useNavigate()
  const user = getCurrentUser() || {}

  const fetchNotifs = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        getNotifications(),
        getUnreadCount()
      ])
      setNotifications(notifRes.data.data)
      setUnreadCount(countRes.data.count)
    } catch (e) {
      console.error('Failed to fetch notifications')
    }
  }

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await markRead(id)
      fetchNotifs()
    } catch (e) {}
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
      fetchNotifs()
    } catch (e) {}
  }

  return (
    <nav className="top-nav">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search for employees, jobs, or documents..." />
      </div>

      <div className="nav-actions">
        {/* Notifications */}
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
                      className={`notif-item ${n.is_read ? '' : 'unread'} ${n.type}`}
                      onClick={() => handleMarkRead(n._id)}
                    >
                      <div className="notif-icon-circle">
                        {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : n.type === 'danger' ? '🚨' : 'ℹ️'}
                      </div>
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      {!n.is_read && <div className="unread-dot"></div>}
                    </div>
                  ))
                )}
              </div>
              <div className="notif-footer">
                <button onClick={() => { setShowNotif(false); navigate('/notifications') }}>View all history</button>
              </div>
            </div>
          )}
        </div>

        <button className="nav-icon-btn">⚙️</button>
        
        <div className="profile-trigger" onClick={() => navigate('/profile')}>
          <div className="nav-user-info">
            <span className="nav-user-name">{user.name || 'HR Admin'}</span>
            <span className="nav-user-role">{user.role?.toUpperCase() || 'ADMIN'}</span>
          </div>
          <div className="user-avatar">
            {user.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </nav>
  )
}
