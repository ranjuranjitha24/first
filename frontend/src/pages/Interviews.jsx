import { useState, useEffect, useCallback } from 'react'
import { getInterviews, addInterview, updateInterview, deleteInterview, getCandidates, getEmployees, getCurrentUser } from '../services/api'

const STAGES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled']
const TYPES = ['HR Round', 'Technical', 'Final Round', 'Cultural Fit']

export default function Interviews() {
  const [interviews, setInterviews] = useState([])
  const [candidates, setCandidates] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [feedbackModal, setFeedbackModal] = useState(null)
  const [form, setForm] = useState({ 
    candidate_id: '', 
    date: new Date().toISOString().split('T')[0], 
    time: '10:00', 
    type: 'Technical', 
    interviewer: '', 
    employee: '', 
    meeting_link: 'https://meet.google.com/new' 
  })
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, feedback: '', status: 'Completed' })
  const [toast, setToast] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 4000) }

  const user        = getCurrentUser() || {}
  const isCandidate = user.role === 'candidate'

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [intRes, candRes, empRes] = await Promise.all([
        getInterviews(), 
        isCandidate ? Promise.resolve({ data: { data: [] } }) : getCandidates(),
        isCandidate ? Promise.resolve({ data: { data: [] } }) : getEmployees()
      ])
      setInterviews(intRes.data.data)
      setCandidates(candRes.data.data)
      setEmployees(empRes.data.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [isCandidate])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.candidate_id || !form.employee) {
      showToast('⚠️ Please select both a candidate and an interviewer')
      return
    }

    setIsSaving(true)
    const payload = {
      candidate_id: form.candidate_id,
      interviewer: form.interviewer || "Staff",
      employee: form.employee,
      date: form.date,
      time: form.time,
      type: form.type,
      meeting_link: form.meeting_link,
      notes: ""
    }

    try {
      const res = await addInterview(payload)
      if (res.data.success) {
        showToast('✅ Interview scheduled successfully!')
        setShowModal(false)
        setForm({ 
          candidate_id: '', 
          date: new Date().toISOString().split('T')[0], 
          time: '10:00', type: 'Technical', interviewer: '', employee: '', 
          meeting_link: 'https://meet.google.com/new' 
        })
        fetchData()
      } else {
        showToast('❌ Server error: ' + (res.data.message || 'Unknown error'))
      }
    } catch (err) { 
      showToast('❌ Network error. Please try again.') 
    } finally {
      setIsSaving(false)
    }
  }

  const handleFeedback = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateInterview(feedbackModal._id, feedbackForm)
      showToast('✅ Feedback submitted!')
      setFeedbackModal(null)
      fetchData()
    } catch (err) { 
      showToast('❌ Update failed') 
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this interview?')) return
    try {
      await updateInterview(id, { status: 'Cancelled' })
      showToast('🚫 Interview cancelled')
      fetchData()
    } catch (e) { }
  }

  const groupInterviewsByDate = () => {
    const groups = {}
    interviews.forEach(i => {
      if (!groups[i.date]) groups[i.date] = []
      groups[i.date].push(i)
    })
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }

  return (
    <div className="page-content page-fade-in">
      {toast && <div className="toast show success" style={{ position: 'fixed', top: 24, right: 24, zIndex: 10001 }}>{toast}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Interview Management</h1>
          <p className="page-sub">Schedule and coordinate candidate assessments</p>
        </div>
        {!isCandidate && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>➕ Schedule Interview</button>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Upcoming Schedule</h3>
          </div>
          <div className="calendar-list">
            {interviews.length === 0 ? (
              <div className="empty-state" style={{ padding: 60 }}>No interviews scheduled.</div>
            ) : (
              groupInterviewsByDate().map(([date, items]) => (
                <div key={date} className="calendar-group">
                  <div className="calendar-date-header">
                    <span className="calendar-date">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="calendar-items">
                    {items.map(item => (
                      <div key={item._id} className={`calendar-item ${item.status.toLowerCase()}`}>
                        <div className="item-time">{item.time}</div>
                        <div className="item-main">
                          <div className="item-title">{item.candidate_name}</div>
                          <div className="item-meta">{item.type} · With {item.interviewer}</div>
                        </div>
                        <div className="item-actions">
                          {item.status === 'Scheduled' && (
                            <>
                              <a href={item.meeting_link} target="_blank" rel="noreferrer" className="btn-join-meet">Join Meet</a>
                              {!isCandidate && (
                                <>
                                  <button className="btn-icon" onClick={() => setFeedbackModal(item)}>📝</button>
                                  <button className="btn-icon delete" onClick={() => handleCancel(item._id)}>🚫</button>
                                </>
                              )}
                            </>
                          )}
                          {item.status === 'Completed' && <span className="status-badge success">Completed</span>}
                          {item.status === 'Cancelled' && <span className="status-badge danger">Cancelled</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Recent Feedback</h3></div>
          <div className="feedback-scroll" style={{ maxHeight: 500, overflowY: 'auto' }}>
            {interviews.filter(i => i.status === 'Completed').length === 0 ? (
              <p style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No feedback records yet.</p>
            ) : (
              interviews.filter(i => i.status === 'Completed').map(i => (
                <div key={i._id} className="feedback-card" style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700 }}>{i.candidate_name}</span>
                    <span style={{ color: 'var(--warning)', fontWeight: 800 }}>{'★'.repeat(i.rating)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{i.feedback}"</p>
                  <div style={{ fontSize: 11, marginTop: 8, color: 'var(--primary)', fontWeight: 600 }}>{i.type} Result</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>📅 Schedule New Interview</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Select Candidate</label>
                  <select value={form.candidate_id} onChange={e => setForm({ ...form, candidate_id: e.target.value })} required>
                    <option value="">Select...</option>
                    {candidates.map(c => <option key={c._id} value={c._id}>{c.name} ({c.job_title})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
                <div className="form-group"><label>Time</label><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required /></div>
                <div className="form-group">
                  <label>Interview Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Interviewer *</label>
                  <select 
                    value={form.employee} 
                    onChange={e => {
                      const emp = employees.find(emp => emp._id === e.target.value)
                      setForm({ ...form, employee: e.target.value, interviewer: emp ? emp.name : '' })
                    }}
                    required
                  >
                    <option value="">Select Interviewer...</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.role})</option>)}
                  </select>
                </div>
                <div className="form-group full-width"><label>Meeting Link (Optional)</label><input value={form.meeting_link} onChange={e => setForm({ ...form, meeting_link: e.target.value })} placeholder="https://zoom.us/j/..." /></div>
              </div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={!form.candidate_id || !form.employee || isSaving}>
                  {isSaving ? '⏳ Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="modal-overlay" onClick={() => setFeedbackModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>📝 Submit Interview Feedback</h3><button className="modal-close" onClick={() => setFeedbackModal(null)}>✕</button></div>
            <form onSubmit={handleFeedback} className="modal-body">
              <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg)', borderRadius: 12 }}>
                <div style={{ fontWeight: 700 }}>{feedbackModal.candidate_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{feedbackModal.type} · {feedbackModal.date} at {feedbackModal.time}</div>
              </div>
              <div className="form-group">
                <label>Overall Rating</label>
                <select value={feedbackForm.rating} onChange={e => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}><label>Feedback & Notes</label><textarea rows="4" value={feedbackForm.feedback} onChange={e => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })} placeholder="How did the candidate perform?" required /></div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setFeedbackModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? '⏳ Submitting...' : 'Submit Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
