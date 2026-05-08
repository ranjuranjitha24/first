import { useState, useEffect, useCallback } from 'react'
import { getReviews, getReviewStats, addReview, getCurrentUser, getEmployees } from '../services/api'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ 
    employee_id: '', period: 'April 2024', rating: 5, performance: 'Excellent', comments: '', 
    achievements: '', promotion_recommendation: false,
    kpis: [
      { name: 'Technical', score: 90 }, { name: 'Communication', score: 85 }, 
      { name: 'Leadership', score: 80 }, { name: 'Punctuality', score: 95 },
      { name: 'Teamwork', score: 90 }
    ]
  })
  const [toast, setToast] = useState('')

  const user = getCurrentUser() || {}
  const isHR = user.role !== 'employee'

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [revRes, statsRes, empRes] = await Promise.all([
        getReviews(),
        !isHR ? getReviewStats({ employee_id: user.employee_id }) : Promise.resolve({ data: { data: null } }),
        isHR ? getEmployees() : Promise.resolve({ data: { data: [] } })
      ])
      setReviews(revRes.data.data)
      setStats(statsRes.data.data)
      setEmployees(empRes.data.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [isHR, user.employee_id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addReview(form)
      showToast('✅ Performance review submitted!')
      setShowModal(false)
      fetchData()
    } catch (err) { showToast('❌ Failed to submit', 'danger') }
  }

  const handleKPIChange = (idx, score) => {
    const newKPIs = [...form.kpis]
    newKPIs[idx].score = parseInt(score)
    setForm({ ...form, kpis: newKPIs })
  }

  return (
    <div className="page-content page-fade-in">
      {toast && <div className="toast show success" style={{ position: 'fixed', top: 24, right: 24, zIndex: 10001 }}>{toast}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">⭐ Performance Reviews</h1>
          <p className="page-sub">{isHR ? 'Evaluate employee growth and set milestones' : 'Track your performance trends and feedback'}</p>
        </div>
        {isHR && <button className="btn-primary" onClick={() => setShowModal(true)}>➕ New Review</button>}
      </div>

      {!isHR && stats && (
        <div className="dashboard-grid" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header"><h3>KPI Distribution</h3></div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.latest_kpis}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <Radar name="Score" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3>Rating History</h3></div>
            <div style={{ height: 300, padding: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis domain={[0, 5]} stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rating" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--primary)', r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>{isHR ? 'Company Reviews' : 'My Reviews'}</h3>
        </div>
        <div className="table-wrapper">
          <table className="emp-table">
            <thead>
              <tr>
                {isHR && <th>Employee</th>}
                <th>Period</th>
                <th>Rating</th>
                <th>Performance</th>
                <th>Promotion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No reviews found</td></tr>
              ) : (
                reviews.map(r => (
                  <tr key={r._id}>
                    {isHR && <td><div className="emp-name-text">{r.employee_name}</div><div className="emp-email-text">{r.employee_role}</div></td>}
                    <td><div style={{ fontWeight: 600 }}>{r.period}</div></td>
                    <td>
                      <div style={{ color: 'var(--warning)', fontWeight: 800 }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${r.performance.toLowerCase() === 'excellent' ? 'success' : r.performance.toLowerCase() === 'good' ? 'primary' : 'warning'}`}>
                        {r.performance}
                      </span>
                    </td>
                    <td>
                      {r.promotion_recommendation ? (
                        <span className="skill-tag" style={{ background: 'var(--success-light)', color: 'var(--success)', border: 'none' }}>🚀 Recommended</span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                    </td>
                    <td><button className="btn-icon" onClick={() => alert(r.comments)}>💬</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>➕ New Performance Review</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Select Employee</label>
                  <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} required>
                    <option value="">Select...</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.role})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Review Period</label><input value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. Q1 2024" required /></div>
                <div className="form-group">
                  <label>Overall Rating</label>
                  <select value={form.rating} onChange={e => setForm({ ...form, rating: parseInt(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Performance Category</label>
                  <select value={form.performance} onChange={e => setForm({ ...form, performance: e.target.value })}>
                    <option>Excellent</option><option>Good</option><option>Average</option><option>Poor</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" checked={form.promotion_recommendation} onChange={e => setForm({ ...form, promotion_recommendation: e.target.checked })} />
                  <label style={{ marginBottom: 0 }}>Recommend for Promotion?</label>
                </div>
                
                <div className="form-group full-width">
                  <label>KPI Scores (1-100)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {form.kpis.map((k, i) => (
                      <div key={k.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '8px 12px', borderRadius: 8 }}>
                        <span style={{ fontSize: 12 }}>{k.name}</span>
                        <input type="number" value={k.score} onChange={e => handleKPIChange(i, e.target.value)} style={{ width: 60, padding: 4 }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group full-width"><label>Achievements</label><textarea rows="2" value={form.achievements} onChange={e => setForm({ ...form, achievements: e.target.value })} placeholder="Key successes this month..." /></div>
                <div className="form-group full-width"><label>Manager Comments</label><textarea rows="3" value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} required /></div>
              </div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
