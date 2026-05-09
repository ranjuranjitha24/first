import { useState, useEffect } from 'react'
import { getNotifications, markRead, markAllRead, getCurrentUser } from '../services/api'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const user = getCurrentUser() || {}

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await getNotifications()
      setNotifications(res.data.data)
    } catch (e) {
      console.error('Error fetching notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await markRead(id)
      setNotifications(notifications.map(n => n._id === id ? { ...n, is_read: true } : n))
    } catch (e) {}
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      setToast('✅ All notifications marked as read')
      setTimeout(() => setToast(''), 3000)
    } catch (e) {}
  }

  return (
    <div className="page-content page-fade-in">
      {toast && <div className="toast show success" style={{ position: 'fixed', top: 24, right: 24, zIndex: 10001 }}>{toast}</div>}
      
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-sub">Stay updated with your latest activities and alerts</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={fetchNotifications}>🔄 Refresh</button>
          <button className="btn-primary" onClick={handleMarkAllRead}>✅ Mark All Read</button>
        </div>
      </div>

      <div className="card glass">
        <div className="notif-full-list">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
          ) : notifications.length === 0 ? (
            <div className="empty-state" style={{ padding: 80 }}>
              <div className="empty-icon">🔔</div>
              <p>You have no notifications at the moment.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n._id} 
                className={`notif-full-item ${n.is_read ? '' : 'unread'} ${n.type}`}
                onClick={() => !n.is_read && handleMarkRead(n._id)}
              >
                <div className="notif-icon-large">
                  {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : n.type === 'danger' ? '🚨' : 'ℹ️'}
                </div>
                <div className="notif-main-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h4 className="notif-full-title">{n.title}</h4>
                    <span className="notif-full-time">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="notif-full-message">{n.message}</p>
                  {!n.is_read && (
                    <button className="btn-mark-read" onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id) }}>
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .notif-full-list {
          display: flex;
          flex-direction: column;
        }
        .notif-full-item {
          display: flex;
          gap: 20px;
          padding: 24px;
          border-bottom: 1px solid var(--border);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .notif-full-item:last-child {
          border-bottom: none;
        }
        .notif-full-item.unread {
          background: var(--primary-glow);
        }
        .notif-full-item:hover {
          background: var(--bg-hover);
        }
        .notif-icon-large {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
        }
        .notif-main-content {
          flex: 1;
        }
        .notif-full-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }
        .notif-full-time {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .notif-full-message {
          margin: 4px 0 12px 0;
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .btn-mark-read {
          background: var(--primary);
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .btn-mark-read:hover {
          transform: translateY(-1px);
        }
      `}} />
    </div>
  )
}
