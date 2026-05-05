import { useState, useEffect, useCallback } from 'react'
import { getCandidates, getPipelineStats, addCandidate, updateCandidate, deleteCandidate, getJobs } from '../services/api'

const STAGES = ['Applied','Shortlisted','Interviewed','Hired','Rejected']
const STAGE_COLORS = { Applied:'info', Shortlisted:'warning', Interviewed:'primary', Hired:'success', Rejected:'danger' }

export default function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [jobs, setJobs]             = useState([])
  const [stats, setStats]           = useState({})
  const [stageFilter, setStageFilter] = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [loading, setLoading]       = useState(true)
  const [toast, setToast]           = useState('')
  const [form, setForm]             = useState({ name:'',email:'',phone:'',job_id:'',resume_link:'',stage:'Applied',notes:'' })

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [cr, jr, sr] = await Promise.all([
        getCandidates(stageFilter ? {stage:stageFilter} : {}),
        getJobs(),
        getPipelineStats()
      ])
      setCandidates(cr.data.data); setJobs(jr.data.data); setStats(sr.data.data)
    } catch(e){ console.error(e) } finally { setLoading(false) }
  }, [stageFilter])

  useEffect(()=>{ fetchAll() }, [fetchAll])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await addCandidate(form); showToast('✅ Candidate added!'); setShowForm(false); fetchAll() }
    catch(err){ showToast('❌ Error') }
  }

  const handleStage = async (id, stage) => {
    try { await updateCandidate(id, {stage}); fetchAll() } catch(e){}
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete candidate?')) return
    try { await deleteCandidate(id); fetchAll() } catch(e){}
  }

  return (
    <div className="page-content">
      {toast && <div className="toast show success">{toast}</div>}
      <div className="page-header">
        <div><h1 className="page-title">🎯 Candidate Pipeline</h1><p className="page-sub">Track applicants through hiring stages</p></div>
        <button className="btn-primary" onClick={()=>setShowForm(s=>!s)}>➕ Add Candidate</button>
      </div>

      {/* Pipeline Stats */}
      <div className="pipeline-stats">
        {STAGES.map(s=>(
          <div key={s} className={`pipeline-stat ${STAGE_COLORS[s]}`} onClick={()=>setStageFilter(f=>f===s?'':s)}>
            <div className="pipeline-count">{stats[s]||0}</div>
            <div className="pipeline-label">{s}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card" style={{marginBottom:24}}>
          <div className="card-header"><h3>Add Candidate</h3></div>

          {/* ⚠️ No jobs warning */}
          {jobs.length === 0 && (
            <div style={{
              margin:'12px 24px 0',padding:'12px 16px',
              background:'#fef3c7',borderRadius:10,
              display:'flex',alignItems:'center',gap:10,fontSize:13,color:'#92400e'
            }}>
              ⚠️ <span>No job postings found. <strong>Go to 💼 Job Postings page first</strong> to create jobs, then come back to add candidates.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{padding:'20px 24px'}}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Rahul Kumar" required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="rahul@email.com" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label>Applied For * {jobs.length===0 && <span style={{color:'#dc2626',fontWeight:400,textTransform:'none'}}>— Add jobs first!</span>}</label>
                <select value={form.job_id} onChange={e=>setForm(f=>({...f,job_id:e.target.value}))} required disabled={jobs.length===0}>
                  <option value="">{jobs.length===0 ? '⚠️ No jobs available — create jobs first' : 'Select Job Opening'}</option>
                  {jobs.map(j=>(
                    <option key={j._id} value={j._id}>
                      {j.title} ({j.department} · {j.status})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Stage</label>
                <select value={form.stage} onChange={e=>setForm(f=>({...f,stage:e.target.value}))}>
                  {STAGES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Resume Link</label>
                <input type="url" value={form.resume_link} onChange={e=>setForm(f=>({...f,resume_link:e.target.value}))} placeholder="https://drive.google.com/..." />
              </div>
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} placeholder="Any additional notes about the candidate..." />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={jobs.length===0}>💾 Save Candidate</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Candidates {stageFilter && `— ${stageFilter}`}</h3>
          <div className="filters">
            <select className="filter-select" value={stageFilter} onChange={e=>setStageFilter(e.target.value)}>
              <option value="">All Stages</option>{STAGES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {loading ? <div className="loading-state">⏳ Loading...</div> : (
          candidates.length===0
            ? <div className="empty-state"><div className="empty-icon">🎯</div><p>No candidates found.</p></div>
            : <div className="table-wrapper">
              <table className="emp-table">
                <thead><tr><th>Name</th><th>Email</th><th>Applied For</th><th>Stage</th><th>Resume</th><th>Actions</th></tr></thead>
                <tbody>
                  {candidates.map(c=>(
                    <tr key={c._id}>
                      <td><div className="emp-name-text">{c.name}</div><div className="emp-email-text">{c.phone}</div></td>
                      <td>{c.email}</td>
                      <td><span className="role-badge">{c.job_title}</span></td>
                      <td>
                        <select className="status-select" value={c.stage} onChange={e=>handleStage(c._id,e.target.value)}>
                          {STAGES.map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>{c.resume_link ? <a href={c.resume_link} target="_blank" rel="noreferrer" className="btn-join-meet">📄 View</a> : '—'}</td>
                      <td><button className="btn-icon delete" onClick={()=>handleDelete(c._id)}>🗑️</button></td>
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
