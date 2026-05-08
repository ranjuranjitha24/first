import { useState, useEffect, useCallback } from 'react'
import { getJobs, addJob, updateJob, deleteJob } from '../services/api'

const JOB_STATUS = ['Open', 'Closed', 'Draft', 'Filled']
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editJob, setEditJob] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Open')
  const [form, setForm] = useState({ title: '', department: 'Engineering', type: 'Full-time', location: 'Remote', description: '', status: 'Open', salary_range: '' })
  const [toast, setToast] = useState('')

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getJobs()
      setJobs(res.data.data)
      applyFilters(res.data.data, search, statusFilter)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [search, statusFilter])

  const applyFilters = (data, q, status) => {
    let result = data
    if (q) result = result.filter(j => j.title.toLowerCase().includes(q.toLowerCase()) || j.department.toLowerCase().includes(q.toLowerCase()))
    if (status) result = result.filter(j => j.status === status)
    setFiltered(result)
  }

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editJob) await updateJob(editJob._id, form)
      else await addJob(form)
      showToast(editJob ? '✅ Job updated!' : '✅ Job posted!')
      setShowModal(false); setEditJob(null)
      setForm({ title: '', department: 'Engineering', type: 'Full-time', location: 'Remote', description: '', status: 'Open', salary_range: '' })
      fetchJobs()
    } catch (err) { showToast('❌ Error') }
  }

  const handleEdit = (job) => {
    setEditJob(job)
    setForm({ title: job.title, department: job.department, type: job.type, location: job.location, description: job.description, status: job.status, salary_range: job.salary_range || '' })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Archive this job posting?')) return
    try { await deleteJob(id); fetchJobs(); showToast('🗑️ Job archived') } catch (e) { }
  }

  return (
    <div className="page-content page-fade-in">
      {toast && <div className="toast show success" style={{ position: 'fixed', top: 24, right: 24, zIndex: 10001 }}>{toast}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">💼 Recruitment Management</h1>
          <p className="page-sub">Manage job openings and monitor applicant flow</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditJob(null); setShowModal(true) }}>➕ Post New Job</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="view-toggle">
            {JOB_STATUS.map(s => (
              <button key={s} className={statusFilter === s ? 'active' : ''} onClick={() => setStatusFilter(s)}>{s}</button>
            ))}
          </div>
          <div className="filters">
            <input className="filter-input" placeholder="🔍 Search roles..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="loading-state" style={{ padding: 60 }}>
            <div className="skeleton-text skeleton" style={{ width: '100%', height: 40, marginBottom: 12 }}></div>
            <div className="skeleton-text skeleton" style={{ width: '100%', height: 40, marginBottom: 12 }}></div>
            <div className="skeleton-text skeleton" style={{ width: '100%', height: 40 }}></div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Type & Location</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No job postings found</td></tr>
                ) : (
                  filtered.map(j => (
                    <tr key={j._id}>
                      <td><div className="emp-name-text">{j.title}</div><div className="emp-email-text">{j.salary_range || 'Competitive'}</div></td>
                      <td><span className="role-badge">{j.department}</span></td>
                      <td><div className="emp-email-text">{j.type} · {j.location}</div></td>
                      <td><div className="pipeline-count" style={{ fontSize: 14, padding: '2px 8px' }}>{j.applicant_count || 0}</div></td>
                      <td><span className={`status-badge ${j.status === 'Open' ? 'success' : j.status === 'Closed' ? 'danger' : 'warning'}`}>{j.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon edit" onClick={() => handleEdit(j)}>✏️</button>
                          <button className="btn-icon delete" onClick={() => handleDelete(j._id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post/Edit Job Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editJob ? '✏️ Edit Job Posting' : '🚀 Post New Job Opening'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width"><label>Job Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Frontend Engineer" required /></div>
                <div className="form-group">
                  <label>Department</label>
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    <option>Engineering</option><option>Design</option><option>Product</option><option>Marketing</option><option>Sales</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Employment Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Remote / Bangalore" /></div>
                <div className="form-group"><label>Salary Range</label><input value={form.salary_range} onChange={e => setForm({ ...form, salary_range: e.target.value })} placeholder="e.g. ₹15L - ₹25L" /></div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {JOB_STATUS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group full-width"><label>Description</label><textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Job roles, requirements, and responsibilities..." required /></div>
              </div>
              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editJob ? 'Update Posting' : 'Publish Job'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
