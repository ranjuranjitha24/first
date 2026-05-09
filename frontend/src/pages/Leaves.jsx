import { useState, useEffect, useCallback } from 'react'
import { getLeaves, addLeave, updateLeave, deleteLeave, getLeaveBalances, getLeaveStats, getCurrentUser } from '../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const LEAVE_TYPES = ['Sick', 'Casual', 'Earned', 'Unpaid', 'Paternity', 'Maternity']
const TYPE_COLORS = { Sick: '#ef4444', Casual: '#f59e0b', Earned: '#10b981', Unpaid: '#6366f1', Paternity: '#3b82f6', Maternity: '#be185d' }
const STATUS_COLORS = { Pending: 'warning', Approved: 'success', Rejected: 'danger' }

export default function Leaves() {
  const [leaves, setLeaves] = useState([])
  const [balances, setBalances] = useState({ Sick: 0, Casual: 0, Earned: 0, used: 0 })
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(null)
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })
  const [form, setForm] = useState({ leave_type: 'Casual', from_date: '', to_date: '', reason: '', duration: 1 })
  const [reviewForm, setReviewForm] = useState({ status: 'Approved', manager_comment: '' })
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
      const [leavesRes, balRes, statsRes] = await Promise.all([
        getLeaves(user.role === 'employee' ? {} : {}),
        !isHR ? getLeaveBalances() : Promise.resolve({ data: { data: null } }),
        isHR ? getLeaveStats() : Promise.resolve({ data: { data: null } })
      ])
      setLeaves(leavesRes.data.data || [])
      if (balRes.data.success && balRes.data.data) setBalances(balRes.data.data)
      if (statsRes.data.success && statsRes.data.data) setStats(statsRes.data.data)
    } catch (e) {
      console.error(e)
      showToast('Error fetching data', 'danger')
    } finally {
      setLoading(false)
    }
  }, [isHR, user.employee_id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await addLeave(form)
      if (res.data.success) {
        showToast('🚀 Leave request submitted successfully!')
        setShowModal(false)
        setForm({ leave_type: 'Casual', from_date: '', to_date: '', reason: '', duration: 1 })
        fetchData()
      } else {
        showToast(res.data.message || 'Failed to submit', 'danger')
      }
    } catch (err) { 
      console.error('Leave Submission Error:', err.response?.data || err.message)
      showToast(err.response?.data?.message || err.response?.data?.detail?.[0]?.msg || '❌ Submission failed', 'danger') 
    } finally {
      setIsSaving(false)
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    try {
      const res = await updateLeave(reviewModal._id, reviewForm)
      if (res.data.success) {
        showToast(`✅ Leave request ${reviewForm.status.toLowerCase()}!`)
        setReviewModal(null)
        fetchData()
      } else {
        showToast(res.data.message || 'Update failed', 'danger')
      }
    } catch (err) { 
      showToast('❌ Update failed', 'danger') 
    }
  }

  const chartData = stats?.by_type?.map(t => ({ name: t._id, value: t.count })) || []

  return (
    <div className="page-content page-fade-in">
      {toast.show && (
        <div className={`toast show ${toast.type} glass`} style={{ position: 'fixed', top: 24, right: 24, zIndex: 10001 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{toast.msg}</span>
            <button onClick={() => setToast({ ...toast, show: false })} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="header-info">
          <h1 className="page-title">🌴 Leave Management</h1>
          <p className="page-sub">{isHR ? 'Centralized dashboard for team leave requests and analytics' : 'Manage your time-off and track leave history'}</p>
        </div>
        {!isHR && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <span style={{ marginRight: 8 }}>➕</span> Apply for Leave
          </button>
        )}
      </div>

      {!isHR && (
        <div className="stats-grid">
          {['Sick', 'Casual', 'Earned'].map(type => (
            <div key={type} className={`stat-card ${type.toLowerCase() === 'sick' ? 'danger' : type.toLowerCase() === 'casual' ? 'warning' : 'success'}`}>
              <div className="stat-card-glow"></div>
              <div className="stat-content">
                <div className="stat-info">
                  <div className="stat-label">{type} Balance</div>
                  <div className="stat-value">{balances[type] || 0}</div>
                </div>
                <div className="stat-icon-wrapper" style={{ fontSize: 24 }}>
                  {type === 'Sick' ? '💊' : type === 'Casual' ? '🏖️' : '🎖️'}
                </div>
              </div>
            </div>
          ))}
          <div className="stat-card primary">
            <div className="stat-card-glow"></div>
            <div className="stat-content">
              <div className="stat-info">
                <div className="stat-label">Total Leaves Used</div>
                <div className="stat-value">{balances.used || 0}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ fontSize: 24 }}>📊</div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card glass" style={{ gridColumn: isHR && stats ? 'span 2' : '1 / -1' }}>
          <div className="card-header">
            <h3>{isHR ? 'Team Leave Requests' : 'My Leave History'}</h3>
            <div className="badge-pill" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              {leaves.length} Total
            </div>
          </div>
          <div className="table-wrapper">
            <table className="emp-table">
              <thead>
                <tr>
                  {isHR && <th>Employee</th>}
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
                ) : leaves.length === 0 ? (
                  <tr><td colSpan="6" className="empty-state"><div className="empty-icon">📂</div><p>No leave requests found</p></td></tr>
                ) : (
                  leaves.map(l => (
                    <tr key={l._id}>
                      {isHR && <td>
                        <div className="emp-name-cell">
                          <div className="avatar" style={{ background: `hsl(${(l.employee_name || 'Unknown').length * 40}, 70%, 50%)` }}>{(l.employee_name || 'U')[0]}</div>
                          <div>
                            <div className="emp-name-text">{l.employee_name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>@{l.employee_username || 'unknown'}</div>
                          </div>
                        </div>
                      </td>}
                      <td>
                        <span className="skill-tag" style={{ background: TYPE_COLORS[l.leave_type] + '20', color: TYPE_COLORS[l.leave_type], border: 'none', fontWeight: 700 }}>
                          {l.leave_type}
                        </span>
                      </td>
                      <td><div style={{ fontWeight: 600 }}>{l.duration} {l.duration === 1 ? 'Day' : 'Days'}</div></td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {l.from_date} <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>→</span> {l.to_date}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${STATUS_COLORS[l.status]}`}>
                          <span className="status-dot"></span>{l.status}
                        </span>
                        {l.manager_comment && (
                          <div style={{ fontSize: 10, marginTop: 4, color: 'var(--text-muted)', maxWidth: 150, fontStyle: 'italic' }}>
                            💬 {l.manager_comment}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {isHR && l.status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12, background: 'var(--success)' }} onClick={() => { setReviewModal(l); setReviewForm({ status: 'Approved', manager_comment: '' }) }}>
                                Approve
                              </button>
                              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12, background: 'var(--danger)' }} onClick={() => { setReviewModal(l); setReviewForm({ status: 'Rejected', manager_comment: '' }) }}>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button className="btn-icon" onClick={() => alert(`Reason: ${l.reason}\n\nRemarks: ${l.manager_comment || 'No remarks provided'}`)} title="View Details">
                              ℹ️
                            </button>
                          )}
                          {!isHR && l.status === 'Pending' && (
                            <button className="btn-icon delete" onClick={async () => {
                              if(window.confirm('Cancel this request?')) {
                                try {
                                  await deleteLeave(l._id)
                                  showToast('Request cancelled')
                                  fetchData()
                                } catch (err) { showToast('Error cancelling', 'danger') }
                              }
                            }}>🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isHR && stats && (
          <div className="card glass">
            <div className="card-header"><h3>Leave Analytics</h3></div>
            <div style={{ padding: 20, height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || '#6366f1'} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 16, border: 'none', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)', color: 'var(--text)' }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal glass" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div>
                <h3>➕ New Leave Request</h3>
                <p>Submit your request for review</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="emp-form" style={{ padding: 24 }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Leave Type</label>
                  <select value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })} required>
                    {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration (Days)</label>
                  <input type="number" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.from_date} onChange={e => setForm({ ...form, from_date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.to_date} onChange={e => setForm({ ...form, to_date: e.target.value })} required />
                </div>
                <div className="form-group full-width">
                  <label>Reason for Leave</label>
                  <textarea rows="4" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Briefly explain your reason..." required />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? '⏳ Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay open" onClick={() => setReviewModal(null)}>
          <div className="modal glass" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div>
                <h3>⚖️ Review Leave Request</h3>
                <p>Approve or reject this request</p>
              </div>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <form onSubmit={handleReview} style={{ padding: 24 }}>
              <div style={{ marginBottom: 24, padding: 20, background: 'var(--primary-glow)', borderRadius: 16, border: '1px solid var(--primary-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="avatar" style={{ background: 'var(--primary)' }}>{(reviewModal?.employee_name || 'U')[0]}</div>
                  <div>
                    <div style={{ fontWeight: 800 }}>{reviewModal?.employee_name || 'Unknown Employee'}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{reviewModal?.leave_type} · {reviewModal?.duration} Days</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', background: 'var(--bg-card)', padding: 12, borderRadius: 10 }}>
                  <span style={{ opacity: 0.6, fontSize: 12, display: 'block', marginBottom: 4 }}>Reason:</span>
                  "{reviewModal.reason}"
                </div>
              </div>
              
              <div className="form-group">
                <label>Decision</label>
                <select 
                  value={reviewForm.status} 
                  onChange={e => setReviewForm({ ...reviewForm, status: e.target.value })}
                  style={{ border: `2px solid var(--${STATUS_COLORS[reviewForm.status]})` }}
                >
                  <option value="Approved">Approve</option>
                  <option value="Rejected">Reject</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: 20 }}>
                <label>Remarks / Feedback</label>
                <textarea rows="3" value={reviewForm.manager_comment} onChange={e => setReviewForm({ ...reviewForm, manager_comment: e.target.value })} placeholder="Add a note for the employee (optional)..." />
              </div>

              <div className="form-actions" style={{ marginTop: 32 }}>
                <button type="button" className="btn-outline" onClick={() => setReviewModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: reviewForm.status === 'Rejected' ? 'var(--danger)' : 'var(--success)' }}>
                  {reviewForm.status === 'Approved' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
