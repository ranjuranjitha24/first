import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { getCandidates, getPipelineStats, addCandidate, updateCandidate, deleteCandidate, getJobs } from '../services/api'

const STAGES = ['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected']
const STAGE_COLORS = { Applied: 'info', Shortlisted: 'warning', Interviewed: 'primary', Hired: 'success', Rejected: 'danger' }

export default function Candidates() {
  const location = useLocation()
  const qParams = new URLSearchParams(location.search)
  const initialSearch = qParams.get('search') || ''

  const [candidates, setCandidates] = useState([])
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({})
  const [search, setSearch] = useState(initialSearch)
  const [viewMode, setViewMode] = useState('pipeline') // 'pipeline' or 'table'
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', job_id: '', resume_link: '', stage: 'Applied' })

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [cr, jr, sr] = await Promise.all([getCandidates(), getJobs(), getPipelineStats()])
      setCandidates(cr.data.data)
      setJobs(jr.data.data)
      setStats(sr.data.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addCandidate(form)
      showToast('✅ Candidate added to pipeline!')
      setShowModal(false)
      fetchData()
    } catch (err) { showToast('❌ Error') }
  }

  const handleStageChange = async (id, stage) => {
    try {
      await updateCandidate(id, { stage })
      fetchData()
    } catch (e) { }
  }

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.job_title && c.job_title.toLowerCase().includes(search.toLowerCase()))
  )

  const renderPipeline = () => (
    <div className="pipeline-board">
      {STAGES.map(stage => (
        <div key={stage} className="pipeline-column">
          <div className="pipeline-header">
            <h4>{stage}</h4>
            <span className="pipeline-count">{filtered.filter(c => c.stage === stage).length}</span>
          </div>
          <div className="pipeline-cards">
            {filtered.filter(c => c.stage === stage).map(c => (
              <div key={c._id} className="pipeline-card-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="card-name" style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                  <button className="btn-icon" onClick={() => {
                    if (c.resume_link) window.open(c.resume_link, '_blank')
                    else alert('No resume link provided')
                  }} title="View Resume">📄</button>
                </div>
                <div className="card-role" style={{ fontSize: 11, marginBottom: 12, opacity: 0.8 }}>{c.job_title}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <select 
                    className="status-select-mini" 
                    value={c.stage} 
                    onChange={e => handleStageChange(c._id, e.target.value)}
                    style={{ fontSize: 11, padding: '4px 8px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                  >
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  
                  {c.stage === 'Shortlisted' && (
                    <button 
                      className="btn-join-meet" 
                      style={{ fontSize: 10, padding: '6px' }}
                      onClick={() => window.location.href = `/interviews?candidate=${c._id}&name=${encodeURIComponent(c.name)}`}
                    >
                      🗓️ Schedule Interview
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="page-content page-fade-in">
      {toast && <div className="toast show success" style={{ position: 'fixed', top: 24, right: 24, zIndex: 10001 }}>{toast}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">🎯 Talent Pipeline</h1>
          <p className="page-sub">Manage candidates across different hiring stages</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button className={viewMode === 'pipeline' ? 'active' : ''} onClick={() => setViewMode('pipeline')}>Pipeline</button>
            <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>All List</button>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>➕ Add Candidate</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3>Candidates</h3>
          <div className="filters">
            <input className="filter-input" placeholder="🔍 Search pipeline..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="loading-state" style={{ padding: 60 }}>⏳ Loading talent database...</div>
        ) : (
          viewMode === 'pipeline' ? renderPipeline() : (
            <div className="table-wrapper">
              <table className="emp-table">
                <thead><tr><th>Name</th><th>Email</th><th>Job</th><th>Stage</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c._id}>
                      <td>
                        <div className="emp-name-text">{c.name}</div>
                        {c.resume_link && <a href={c.resume_link} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: 'var(--primary)' }}>View Resume</a>}
                      </td>
                      <td>{c.email}</td>
                      <td><span className="role-badge">{c.job_title}</span></td>
                      <td>
                        <span className={`status-badge ${STAGE_COLORS[c.stage]}`}>
                          <span className="status-dot"></span>{c.stage}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <select className="status-select" value={c.stage} onChange={e => handleStageChange(c._id, e.target.value)}>
                            {STAGES.map(s => <option key={s}>{s}</option>)}
                          </select>
                          {c.stage === 'Shortlisted' && (
                            <button className="btn-icon" onClick={() => window.location.href = `/interviews?candidate=${c._id}&name=${encodeURIComponent(c.name)}`} title="Schedule Interview">🗓️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Add Candidate Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>➕ Add Candidate</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                <div className="form-group">
                  <label>Job *</label>
                  <select value={form.job_id} onChange={e => setForm({ ...form, job_id: e.target.value })} required>
                    <option value="">Select Job...</option>
                    {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Resume Link</label>
                  <input 
                    type="text"
                    value={form.resume_link} 
                    onChange={e => setForm({ ...form, resume_link: e.target.value })} 
                    placeholder="e.g., https://drive.google.com/..." 
                  />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
