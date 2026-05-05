import { useState, useEffect, useCallback } from 'react'
import { getLeaves, addLeave, updateLeave, deleteLeave, getEmployees, getCurrentUser } from '../services/api'

const TYPES   = ['Sick','Casual','Earned','Unpaid']
const STATUSES = ['Pending','Approved','Rejected']
const STATUS_COLORS = { Pending:'warning', Approved:'success', Rejected:'danger' }

export default function Leaves() {
  const [leaves, setLeaves]       = useState([])
  const [employees, setEmployees] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState('')
  const [form, setForm]           = useState({ employee_id:'',leave_type:'Casual',from_date:'',to_date:'',reason:'' })

  const user = getCurrentUser()
  const isHR = user && user.role !== 'employee'

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getLeaves(statusFilter ? { status: statusFilter } : {})
      setLeaves(res.data.data)
    } catch (e) { console.error('Failed to fetch leaves:', e) }

    if (isHR) {
      try {
        const res = await getEmployees()
        setEmployees(res.data.data)
      } catch (e) { console.error('Failed to fetch employees:', e) }
    }
    setLoading(false)
  }, [statusFilter, isHR])

  useEffect(()=>{ fetchAll() }, [fetchAll])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await addLeave(form); showToast('✅ Leave submitted!'); setShowForm(false); fetchAll() }
    catch(err){ showToast('❌ Error') }
  }

  const handleStatus = async (id, status) => {
    try { await updateLeave(id,{status}); showToast(`Leave ${status}`); fetchAll() } catch(e){}
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete?')) return
    try { await deleteLeave(id); fetchAll() } catch(e){}
  }

  const daysBetween = (from, to) => {
    const d1=new Date(from), d2=new Date(to)
    return Math.ceil((d2-d1)/(1000*60*60*24))+1
  }

  return (
    <div className="page-content">
      {toast && <div className="toast show success">{toast}</div>}
      <div className="page-header">
        <div><h1 className="page-title">{isHR ? '🌴 Leave Tracker' : '🌴 My Leaves'}</h1><p className="page-sub">{isHR ? 'Manage employee leave requests' : 'View and submit leave requests'}</p></div>
        <button className="btn-primary" onClick={()=>setShowForm(s=>!s)}>➕ New Leave</button>
      </div>

      {showForm && (
        <div className="card" style={{marginBottom:24}}>
          <div className="card-header"><h3>Submit Leave Request</h3></div>
          <form onSubmit={handleSubmit} style={{padding:'20px 24px'}}>
            <div className="form-grid">
              {isHR && (
                <div className="form-group"><label>Employee *</label>
                  <select value={form.employee_id} onChange={e=>setForm(f=>({...f,employee_id:e.target.value}))} required>
                    <option value="">Select Employee</option>{employees.map(e=><option key={e._id} value={e._id}>{e.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group"><label>Leave Type</label>
                <select value={form.leave_type} onChange={e=>setForm(f=>({...f,leave_type:e.target.value}))}>
                  {TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label>From Date *</label><input type="date" value={form.from_date} onChange={e=>setForm(f=>({...f,from_date:e.target.value}))} required /></div>
              <div className="form-group"><label>To Date *</label><input type="date" value={form.to_date} onChange={e=>setForm(f=>({...f,to_date:e.target.value}))} required /></div>
              <div className="form-group full-width"><label>Reason *</label><textarea value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} rows={2} required /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">💾 Submit</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Leave Requests ({leaves.length})</h3>
          <div className="filters">
            <select className="filter-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option value="">All Status</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {loading ? <div className="loading-state">⏳ Loading...</div> : (
          leaves.length===0
            ? <div className="empty-state"><div className="empty-icon">🌴</div><p>No leave requests.</p></div>
            : <div className="table-wrapper">
              <table className="emp-table">
                <thead><tr>{isHR && <th>Employee</th>}<th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {leaves.map(l=>(
                    <tr key={l._id}>
                      {isHR && <td><div className="emp-name-text">{l.employee_name}</div><div className="emp-email-text">{l.employee_role}</div></td>}
                      <td><span className="skill-tag">{l.leave_type}</span></td>
                      <td>{l.from_date}</td>
                      <td>{l.to_date}</td>
                      <td><strong>{daysBetween(l.from_date,l.to_date)}</strong> days</td>
                      <td style={{maxWidth:160,fontSize:12}}>{l.reason}</td>
                      <td><span className={`status-badge ${STATUS_COLORS[l.status]||'scheduled'}`}><span className="status-dot"/>{l.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          {isHR && l.status==='Pending' && <>
                            <button className="btn-icon" style={{fontSize:12}} onClick={()=>handleStatus(l._id,'Approved')}>✅</button>
                            <button className="btn-icon" style={{fontSize:12}} onClick={()=>handleStatus(l._id,'Rejected')}>❌</button>
                          </>}
                          {(isHR || l.status==='Pending') && <button className="btn-icon delete" onClick={()=>handleDelete(l._id)}>🗑️</button>}
                        </div>
                      </td>
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
