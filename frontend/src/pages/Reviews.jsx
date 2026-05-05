import { useState, useEffect, useCallback } from 'react'
import { getReviews, addReview, deleteReview, getEmployees, getCurrentUser } from '../services/api'

const PERF = ['Excellent','Good','Average','Poor']

function Stars({ rating }) {
  return <span>{Array(5).fill(0).map((_,i)=><span key={i} style={{color:i<rating?'#f59e0b':'#e5e7eb',fontSize:16}}>★</span>)}</span>
}

export default function Reviews() {
  const [reviews, setReviews]     = useState([])
  const [employees, setEmployees] = useState([])
  const [empFilter, setEmpFilter] = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState('')
  const [form, setForm]           = useState({ employee_id:'',period:'',rating:5,performance:'Excellent',comments:'',goals_met:true })

  const user = getCurrentUser()
  const isHR = user && user.role !== 'employee'

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getReviews(empFilter ? { employee_id: empFilter } : {})
      setReviews(res.data.data)
    } catch (e) { console.error('Failed to fetch reviews:', e) }

    if (isHR) {
      try {
        const res = await getEmployees()
        setEmployees(res.data.data)
      } catch (e) { console.error('Failed to fetch employees:', e) }
    }
    setLoading(false)
  }, [empFilter, isHR])

  useEffect(()=>{ fetchAll() }, [fetchAll])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await addReview(form); showToast('✅ Review added!'); setShowForm(false); fetchAll() }
    catch(err){ showToast('❌ Error: ' + (err.response?.data?.detail||'')) }
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete review?')) return
    try { await deleteReview(id); fetchAll() } catch(e){}
  }

  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : '—'

  return (
    <div className="page-content">
      {toast && <div className="toast show success">{toast}</div>}
      <div className="page-header">
        <div><h1 className="page-title">{isHR ? '⭐ Performance Reviews' : '⭐ My Reviews'}</h1><p className="page-sub">{isHR ? 'Track and rate employee performance' : 'View your performance feedback'}</p></div>
        {isHR && <button className="btn-primary" onClick={()=>setShowForm(s=>!s)}>➕ Add Review</button>}
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:24}}>
        <div className="stat-card primary"><div className="stat-icon">📝</div><div className="stat-info"><div className="stat-value">{reviews.length}</div><div className="stat-label">Total Reviews</div></div></div>
        <div className="stat-card success"><div className="stat-icon">⭐</div><div className="stat-info"><div className="stat-value">{avgRating}</div><div className="stat-label">Avg Rating</div></div></div>
        <div className="stat-card warning"><div className="stat-icon">🏆</div><div className="stat-info"><div className="stat-value">{reviews.filter(r=>r.performance==='Excellent').length}</div><div className="stat-label">Excellent</div></div></div>
      </div>

      {isHR && showForm && (
        <div className="card" style={{marginBottom:24}}>
          <div className="card-header"><h3>Add Performance Review</h3></div>
          <form onSubmit={handleSubmit} style={{padding:'20px 24px'}}>
            <div className="form-grid">
              <div className="form-group"><label>Employee *</label>
                <select value={form.employee_id} onChange={e=>setForm(f=>({...f,employee_id:e.target.value}))} required>
                  <option value="">Select Employee</option>{employees.map(e=><option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Review Period *</label><input value={form.period} onChange={e=>setForm(f=>({...f,period:e.target.value}))} placeholder="e.g. Q1 2025" required /></div>
              <div className="form-group"><label>Rating (1-5) *</label>
                <div className="star-input">
                  {[1,2,3,4,5].map(n=>(
                    <span key={n} style={{fontSize:28,cursor:'pointer',color:n<=form.rating?'#f59e0b':'#e5e7eb'}}
                      onClick={()=>setForm(f=>({...f,rating:n}))}>★</span>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>Performance</label>
                <select value={form.performance} onChange={e=>setForm(f=>({...f,performance:e.target.value}))}>
                  {PERF.map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group full-width"><label>Comments *</label><textarea value={form.comments} onChange={e=>setForm(f=>({...f,comments:e.target.value}))} rows={3} required /></div>
              <div className="form-group">
                <label>Goals Met?</label>
                <select value={form.goals_met} onChange={e=>setForm(f=>({...f,goals_met:e.target.value==='true'}))}>
                  <option value="true">✅ Yes</option><option value="false">❌ No</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">💾 Save Review</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>{isHR ? 'All Reviews' : 'My Feedback'} ({reviews.length})</h3>
          {isHR && (
            <select className="filter-select" value={empFilter} onChange={e=>setEmpFilter(e.target.value)}>
              <option value="">All Employees</option>{employees.map(e=><option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          )}
        </div>
        {loading ? <div className="loading-state">⏳ Loading...</div> : (
          reviews.length===0
            ? <div className="empty-state"><div className="empty-icon">⭐</div><p>No reviews yet.</p></div>
            : <div className="table-wrapper">
              <table className="emp-table">
                <thead><tr>{isHR && <th>Employee</th>}<th>Period</th><th>Rating</th><th>Performance</th><th>Goals Met</th><th>Comments</th>{isHR && <th>Actions</th>}</tr></thead>
                <tbody>
                  {reviews.map(r=>(
                    <tr key={r._id}>
                      {isHR && <td><div className="emp-name-text">{r.employee_name}</div><div className="emp-email-text">{r.employee_role}</div></td>}
                      <td><span className="skill-tag">{r.period}</span></td>
                      <td><Stars rating={r.rating}/></td>
                      <td><span className={`status-badge ${r.performance==='Excellent'?'success':r.performance==='Good'?'scheduled':r.performance==='Average'?'warning':'cancelled'}`}><span className="status-dot"/>{r.performance}</span></td>
                      <td>{r.goals_met?'✅ Yes':'❌ No'}</td>
                      <td style={{maxWidth:180,fontSize:12}}>{r.comments}</td>
                      {isHR && <td><button className="btn-icon delete" onClick={()=>handleDelete(r._id)}>🗑️</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  )
}
