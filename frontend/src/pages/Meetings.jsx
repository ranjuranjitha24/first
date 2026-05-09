import { useState, useEffect, useCallback } from 'react'
import { getMeetings, addMeeting, updateMeeting, deleteMeeting, getEmployees, getCurrentUser } from '../services/api'

export default function Meetings() {
  const [meetings, setMeetings] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0], 
    time: '10:00', 
    meeting_link: 'https://meet.google.com/new', 
    assigned_employee: '' 
  })
  const [isSaving, setIsSaving] = useState(false)
  
  const user = getCurrentUser() || {}
  const isHR = user.role !== 'employee'

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [meetRes, empRes] = await Promise.all([
        getMeetings(isHR ? {} : { employee_id: user.employee_id }),
        isHR ? getEmployees() : Promise.resolve({ data: { data: [] } })
      ])
      setMeetings(meetRes.data.data || [])
      setEmployees(empRes.data.data || [])
    } catch (e) {
      console.error(e)
      showToast('Error loading meetings', 'error')
    } finally {
      setLoading(false)
    }
  }, [isHR, user.employee_id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.assigned_employee) {
      showToast('⚠️ Please select an employee to meet with', 'warning')
      return
    }
    setIsSaving(true)
    try {
      const res = await addMeeting(form)
      if (res.data.success) {
        showToast('✅ Meeting scheduled successfully!')
        setShowModal(false)
        setForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '10:00', meeting_link: 'https://meet.google.com/new', assigned_employee: '' })
        fetchData()
      } else {
        showToast('❌ Failed: ' + (res.data.message || 'Unknown error'), 'error')
      }
    } catch (err) {
      showToast('❌ Network error. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateMeeting(id, { status })
      showToast(`Meeting ${status.toLowerCase()}!`)
      fetchData()
    } catch (e) {
      showToast('Update failed', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return
    try {
      await deleteMeeting(id)
      showToast('Meeting deleted')
      fetchData()
    } catch (e) {
      showToast('Delete failed', 'error')
    }
  }

  const groupMeetings = () => {
    const groups = {}
    meetings.forEach(m => {
      if (!groups[m.date]) groups[m.date] = []
      groups[m.date].push(m)
    })
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }

  return (
    <div className="page-content page-fade-in">
      {toast.show && (
        <div className={`toast show ${toast.type} glass`} style={{ position: 'fixed', top: 24, right: 24, zIndex: 10001 }}>
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Meeting Scheduler</h1>
          <p className="page-sub">
            {isHR ? 'Coordinate and track team sync-ups and one-on-ones' : 'View your upcoming sync-ups and team meetings'}
          </p>
        </div>
        {isHR && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>➕ Schedule Meeting</button>
        )}
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card glass">
          <div className="card-header">
            <h3>Upcoming Meetings</h3>
          </div>
          <div className="calendar-list" style={{ padding: '0 24px 24px' }}>
            {loading ? (
              <div className="loading-state">⏳ Loading schedule...</div>
            ) : meetings.length === 0 ? (
              <div className="empty-state" style={{ padding: 60 }}>
                <div className="empty-icon">📅</div>
                <p>No meetings scheduled yet.</p>
              </div>
            ) : (
              groupMeetings().map(([date, items]) => (
                <div key={date} className="calendar-group" style={{ marginBottom: 32 }}>
                  <div className="calendar-date-header" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px', borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
                      {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                  </div>
                  <div className="calendar-items" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
                    {items.map(item => (
                      <div key={item._id} className={`meeting-card glass ${item.status.toLowerCase()}`} style={{ padding: 20, borderRadius: 20, border: '1px solid var(--border)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}>
                        <div className={`status-tag ${item.status.toLowerCase()}`} style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                          {item.status}
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60, padding: '12px', background: 'var(--primary-glow)', borderRadius: 16 }}>
                            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{item.time}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700 }}>{item.title}</h4>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.description}
                            </p>
                            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="avatar mini" style={{ background: 'var(--primary)', width: 24, height: 24, fontSize: 10 }}>
                                {item.assigned_employee_name?.[0] || 'E'}
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600 }}>{item.assigned_employee_name}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                          <a href={item.meeting_link} target="_blank" rel="noreferrer" className="btn-join-meet" style={{ flex: 1, textAlign: 'center', background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
                            Join Meeting
                          </a>
                          {isHR && item.status === 'Scheduled' && (
                            <button className="btn-icon danger" onClick={() => handleStatusUpdate(item._id, 'Cancelled')} title="Cancel Meeting">🚫</button>
                          )}
                          {isHR && (
                            <button className="btn-icon" onClick={() => handleDelete(item._id)} title="Delete Meeting">🗑️</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div>
                <h3>📅 Schedule New Meeting</h3>
                <p>Set up a sync-up or team meeting</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="emp-form" style={{ padding: 24 }}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Meeting Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Q3 Strategy Sync" required />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Briefly explain the purpose of the meeting..." required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                </div>
                <div className="form-group full-width">
                  <label>Assigned Employee</label>
                  <select value={form.assigned_employee} onChange={e => setForm({ ...form, assigned_employee: e.target.value })} required>
                    <option value="">Select Employee...</option>
                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>)}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Meeting Link</label>
                  <input value={form.meeting_link} onChange={e => setForm({ ...form, meeting_link: e.target.value })} placeholder="https://meet.google.com/..." />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={!form.assigned_employee || isSaving}>
                  {isSaving ? '⏳ Scheduling...' : 'Schedule Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
