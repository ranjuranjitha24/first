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

  const user = getCurrentUser() || {}
  const isHR = user.role !== 'employee'

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [leavesRes, balRes, statsRes] = await Promise.all([
        getLeaves(),
        !isHR ? getLeaveBalances() : Promise.resolve({ data: { data: null } }),
        isHR ? getLeaveStats() : Promise.resolve({ data: { data: null } })
      ])
      setLeaves(leavesRes.data.data)
      if (balRes.data.data) setBalances(balRes.data.data)
      if (statsRes.data.data) setStats(statsRes.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [isHR])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addLeave(form)
      showToast('✅ Leave request submitted!')
      setShowModal(false)
      setForm({ leave_type: 'Casual', from_date: '', to_date: '', reason: '', duration: 1 })
      fetchData()
    } catch (err) { showToast('❌ Failed to submit', 'danger') }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    try {
      await updateLeave(reviewModal._id, reviewForm)
      showToast(`✅ Request ${reviewForm.status.toLowerCase()}!`)
      setReviewModal(null)
      fetchData()
    } catch (err) { showToast('❌ Update failed', 'danger') }
  }

  const chartData = stats?.by_type?.map(t => ({ name: t._id, value: t.count })) || []

  return (
    <div className="page-content page-fade-in">
      {toast.show && <div className={`toast show ${toast.type}`} style={{ position: 'fixed', top: 24, right: 24, zIndex: 10001 }}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">🌴 Leave Management</h1>
          <p className="page-sub">{isHR ? 'Review and manage team time-off requests' : 'Apply for leave and track your balances'}</p>
        </div>
        {!isHR && <button className="btn-primary" onClick={() => setShowModal(true)}>➕ Apply for Leave</button>}
      </div>

      {!isHR && (
        <div className="stats-grid">
          {['Sick', 'Casual', 'Earned'].map(type => (
            <div key={type} className={`stat-card ${type.toLowerCase() === 'sick' ? 'danger' : type.toLowerCase() === 'casual' ? 'warning' : 'success'}`}>
              <div className="stat-card-glow"></div>
              <div className="stat-info">
                <div className="stat-value">{balances[type] || 0}</div>
                <div className="stat-label">{type} Balance</div>
              </div>
            </div>
          ))}
          <div className="stat-card primary">
            <div className="stat-card-glow"></div>
            <div className="stat-info">
              <div className="stat-value">{balances.used || 0}</div>
              <div className="stat-label">Total Used</div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card" style={{ gridColumn: isHR && stats ? 'span 2' : '1 / -1' }}>
          <div className="card-header">
            <h3>{isHR ? 'All Requests' : 'My Leave History'}</h3>
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
                {leaves.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No requests found</td></tr>
                ) : (
                  leaves.map(l => (
                    <tr key={l._id}>
                      {isHR && <td><div className="emp-name-text">{l.employee_name}</div></td>}
                      <td><span className="skill-tag" style={{ background: TYPE_COLORS[l.leave_type] + '20', color: TYPE_COLORS[l.leave_type], border: 'none' }}>{l.leave_type}</span></td>
                      <td>{l.duration} Days</td>
                      <td><div style={{ fontSize: 13, fontWeight: 600 }}>{l.from_date} <span style={{ color: 'var(--text-muted)' }}>→</span> {l.to_date}</div></td>
                      <td>
                        <span className={`status-badge ${STATUS_COLORS[l.status]}`}>
                          <span className="status-dot"></span>{l.status}
                        </span>
                      </td>
                      <td>
                        {isHR && l.status === 'Pending' ? (
                          <button className="btn-join-meet" onClick={() => { setReviewModal(l); setReviewForm({ status: 'Approved', manager_comment: '' }) }}>Review</button>
                        ) : (
                          <button className="btn-icon" onClick={() => alert(l.manager_comment || 'No comments')}>💬</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isHR && stats && (
          <div className="card">
            <div className="card-header"><h3>Leave Analytics</h3></div>
            <div style={{ padding: 20, height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || COLORS[index % 8]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>➕ Apply for Leave</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Leave Type</label>
                  <select value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })}>
                    {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Duration (Days)</label><input type="number" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} /></div>
                <div className="form-group"><label>From Date</label><input type="date" value={form.from_date} onChange={e => setForm({ ...form, from_date: e.target.value })} required /></div>
                <div className="form-group"><label>To Date</label><input type="date" value={form.to_date} onChange={e => setForm({ ...form, to_date: e.target.value })} required /></div>
                <div className="form-group full-width"><label>Reason</label><textarea rows="3" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required /></div>
              </div>
              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>⚖️ Review Leave Request</h3><button className="modal-close" onClick={() => setReviewModal(null)}>✕</button></div>
            <form onSubmit={handleReview} className="modal-body">
              <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg)', borderRadius: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{reviewModal.employee_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{reviewModal.leave_type} · {reviewModal.duration} Days ({reviewModal.from_date} to {reviewModal.to_date})</div>
                <div style={{ marginTop: 12, fontSize: 13, fontStyle: 'italic' }}>"{reviewModal.reason}"</div>
              </div>
              <div className="form-group">
                <label>Decision</label>
                <select value={reviewForm.status} onChange={e => setReviewForm({ ...reviewForm, status: e.target.value })}>
                  <option value="Approved">Approve</option><option value="Rejected">Reject</option>
                </select>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}><label>Manager Comments</label><textarea rows="2" value={reviewForm.manager_comment} onChange={e => setReviewForm({ ...reviewForm, manager_comment: e.target.value })} placeholder="Optional feedback..." /></div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setReviewModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
