import { updateInterview, deleteInterview } from '../services/api'
import { useState } from 'react'

const COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2','#be185d']
const getColor = n => { let h=0; for(let c of (n||'?')) h+=c.charCodeAt(0); return COLORS[h%COLORS.length] }
const getInit  = n => (n||'?').split(' ').map(p=>p[0]).join('').substring(0,2).toUpperCase()

export default function InterviewList({ interviews, onRefresh, isHR = true }) {
  const [updating, setUpdating] = useState(null)

  const handleStatus = async (id, status) => {
    setUpdating(id)
    try { await updateInterview(id, { status }); onRefresh() } catch(e) {} finally { setUpdating(null) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this interview?')) return
    try { await deleteInterview(id); onRefresh() } catch(e) { alert('Error') }
  }

  if (!interviews.length) return (
    <div className="empty-state"><div className="empty-icon">📅</div><p>No interviews found.</p></div>
  )

  const sorted = [...interviews].sort((a,b) => (a.date+a.time)>(b.date+b.time)?1:-1)

  return (
    <div className="table-wrapper">
      <table className="emp-table">
        <thead>
          <tr>{isHR && <th>Employee</th>}<th>Role</th><th>Date</th><th>Time</th><th>Type</th><th>Meeting</th><th>Status</th>{isHR && <th>Actions</th>}</tr>
        </thead>
        <tbody>
          {sorted.map(i => {
            const emp  = i.employee
            const name = emp?.name || 'Unknown'
            const d    = new Date(i.date + 'T00:00:00')
            const ds   = d.toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})
            const [h,m] = i.time.split(':'); const hr=parseInt(h); const ap=hr>=12?'PM':'AM'
            const ts   = `${hr%12||12}:${m} ${ap}`
            const sc   = i.status.toLowerCase()
            return (
              <tr key={i._id}>
                {isHR && (
                  <td>
                    <div className="emp-name-cell">
                      <div className="avatar" style={{background:getColor(name),width:34,height:34,fontSize:11}}>{getInit(name)}</div>
                      <div><div className="emp-name-text">{name}</div><div className="emp-email-text">{emp?.email||''}</div></div>
                    </div>
                  </td>
                )}
                <td><span className="role-badge">{emp?.role||'—'}</span></td>
                <td>{ds}</td>
                <td>{ts}</td>
                <td>{i.type}</td>
                <td>
                  {i.meeting_link ? (
                    <a href={i.meeting_link} target="_blank" rel="noreferrer" className="btn-join-meet">
                      🎥 Join
                    </a>
                  ) : (
                    <span style={{color:'var(--text-muted)',fontSize:12}}>No link</span>
                  )}
                </td>
                <td><span className={`status-badge ${sc}`}><span className="status-dot"/>{i.status}</span></td>
                {isHR && (
                  <td>
                    <div className="action-buttons">
                      <select className="status-select" value={i.status}
                        onChange={e=>handleStatus(i._id,e.target.value)} disabled={updating===i._id}>
                        <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
                      </select>
                      <button className="btn-icon delete" onClick={()=>handleDelete(i._id)}>🗑️</button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
