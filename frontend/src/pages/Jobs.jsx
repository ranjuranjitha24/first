import { useState, useEffect, useCallback } from 'react'
import { getJobs, addJob, updateJob, deleteJob } from '../services/api'

const TYPES = ['Full-Time','Part-Time','Contract','Internship']
const DEPTS = ['Engineering','Design','Product','Marketing','Sales','HR','Finance','Operations']

const STATUS_COLORS = { Open:'success', Closed:'danger', 'On Hold':'warning' }

export default function Jobs() {
  const [jobs, setJobs]       = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast]     = useState('')
  const [form, setForm]       = useState({ title:'',department:'',location:'',type:'Full-Time',description:'',requirements:'',status:'Open' })

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try { const r = await getJobs(); setJobs(r.data.data) }
    catch(e){ console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await addJob(form); showToast('✅ Job posted!'); setShowForm(false); setForm({title:'',department:'',location:'',type:'Full-Time',description:'',requirements:'',status:'Open'}); fetchJobs() }
    catch(err) { showToast('❌ Error posting job') }
  }

  const handleClose = async (id) => {
    try { await updateJob(id, { status:'Closed' }); showToast('Job closed'); fetchJobs() } catch(e){}
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete this job?')) return
    try { await deleteJob(id); showToast('Deleted'); fetchJobs() } catch(e){}
  }

  return (
    <div className="page-content">
      {toast && <div className="toast show success">{toast}</div>}
      <div className="page-header">
        <div><h1 className="page-title">💼 Job Postings</h1><p className="page-sub">Manage open positions</p></div>
        <button className="btn-primary" onClick={()=>setShowForm(s=>!s)}>➕ Post New Job</button>
      </div>

      {showForm && (
        <div className="card" style={{marginBottom:24}}>
          <div className="card-header"><h3>Post New Job</h3></div>
          <form onSubmit={handleSubmit} style={{padding:'20px 24px'}}>
            <div className="form-grid">
              <div className="form-group"><label>Job Title *</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Senior React Developer" required /></div>
              <div className="form-group"><label>Department *</label>
                <select value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))} required>
                  <option value="">Select Dept</option>{DEPTS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Location *</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="e.g. Bangalore / Remote" required /></div>
              <div className="form-group"><label>Type</label>
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  {TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group full-width"><label>Description *</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} required /></div>
              <div className="form-group full-width"><label>Requirements</label><textarea value={form.requirements} onChange={e=>setForm(f=>({...f,requirements:e.target.value}))} rows={2} placeholder="Skills, experience, etc." /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">💾 Post Job</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="loading-state">⏳ Loading...</div> : (
        <div className="jobs-grid">
          {jobs.length===0 && <div className="empty-state"><div className="empty-icon">💼</div><p>No jobs posted yet.</p></div>}
          {jobs.map(j=>(
            <div key={j._id} className="job-card">
              <div className="job-card-header">
                <div>
                  <h3 className="job-title">{j.title}</h3>
                  <div className="job-meta">{j.department} · {j.location}</div>
                </div>
                <span className={`status-badge ${STATUS_COLORS[j.status]||'scheduled'}`}>
                  <span className="status-dot"/>{j.status}
                </span>
              </div>
              <div className="job-type-badge">{j.type}</div>
              <p className="job-desc">{j.description.substring(0,120)}{j.description.length>120?'...':''}</p>
              <div className="job-actions">
                {j.status==='Open' && <button className="btn-outline" style={{fontSize:12,padding:'6px 12px'}} onClick={()=>handleClose(j._id)}>🔒 Close</button>}
                <button className="btn-icon delete" onClick={()=>handleDelete(j._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
