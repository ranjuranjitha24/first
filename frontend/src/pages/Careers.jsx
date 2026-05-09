import { useState, useEffect } from 'react'
import { getPortalJobs, applyForJob, getCurrentUser } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Careers() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(null)
  const [applyForm, setApplyForm] = useState({ name: '', email: '', resume: '' })
  const navigate = useNavigate()
  const user = getCurrentUser()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await getPortalJobs()
        setJobs(res.data.data)
      } catch (e) { } finally { setLoading(false) }
    }
    fetchJobs()
  }, [])

  useEffect(() => {
    if (user) setApplyForm({ name: user.username, email: user.username, resume: '' })
  }, [user])

  const handleApply = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Please login as a candidate to apply.')
      navigate('/login')
      return
    }
    
    try {
      setApplying(showApplyModal._id)
      await applyForJob({ job_id: showApplyModal._id, ...applyForm })
      alert('🚀 Application submitted successfully! Track your status in your dashboard.')
      setShowApplyModal(null)
    } catch (err) {
      alert('Failed to apply.')
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="public-container page-fade-in" style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: 60 }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>Find Your Dream Career</h1>
        <p style={{ fontSize: 18, color: 'var(--text-muted)' }}>Join our team of innovators and shape the future of technology.</p>
      </header>

      {loading ? (
        <div className="dashboard-grid">
          {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: 200 }}></div>)}
        </div>
      ) : (
        <div className="dashboard-grid">
          {jobs.length === 0 ? (
            <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No open positions at the moment. Check back later!</p>
          ) : (
            jobs.map(job => (
              <div key={job._id} className="card job-card-public">
                <div className="job-badge">{job.department}</div>
                <h3 className="job-title">{job.title}</h3>
                <div className="job-meta">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary}</span>
                  <span>⏱️ {job.type}</span>
                </div>
                <p className="job-desc">{job.description.substring(0, 150)}...</p>
                <div className="job-tags" style={{ marginBottom: 20 }}>
                  {(job.required_skills || "").split(',').map(tag => (
                    <span key={tag} className="skill-tag">{tag.trim()}</span>
                  ))}
                </div>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => setShowApplyModal(job)}
                  disabled={applying === job._id}
                >
                  {applying === job._id ? 'Applying...' : 'View Details & Apply'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Application Modal */}
      {showApplyModal && (
        <div className="modal-overlay open" onClick={() => setShowApplyModal(null)}>
          <div className="modal glass" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div>
                <h3>Apply for {showApplyModal.title}</h3>
                <p>{showApplyModal.department} · {showApplyModal.location}</p>
              </div>
              <button className="modal-close" onClick={() => setShowApplyModal(null)}>✕</button>
            </div>
            <form onSubmit={handleApply} className="emp-form" style={{ padding: 24 }}>
              <div style={{ marginBottom: 20, padding: 16, background: 'var(--primary-glow)', borderRadius: 12 }}>
                <h4 style={{ marginBottom: 8 }}>Job Requirements:</h4>
                <p style={{ fontSize: 14 }}>{showApplyModal.requirements}</p>
              </div>
              <div className="form-grid">
                <div className="form-group"><label>Full Name</label><input value={applyForm.name} onChange={e => setApplyForm({...applyForm, name: e.target.value})} required /></div>
                <div className="form-group"><label>Email Address</label><input type="email" value={applyForm.email} onChange={e => setApplyForm({...applyForm, email: e.target.value})} required /></div>
                <div className="form-group full-width">
                  <label>Resume Link (Google Drive / Dropbox)</label>
                  <input placeholder="https://..." value={applyForm.resume} onChange={e => setApplyForm({...applyForm, resume: e.target.value})} required />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setShowApplyModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={applying}>
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
