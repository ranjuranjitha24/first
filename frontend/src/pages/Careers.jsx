import { useState, useEffect } from 'react'
import { getPortalJobs, applyForJob, getMyApplications, getCurrentUser } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Careers() {
  const [jobs, setJobs] = useState([])
  const [myApps, setMyApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('available') // 'available' or 'applied'
  const [showApplyModal, setShowApplyModal] = useState(null)
  const [applyForm, setApplyForm] = useState({ name: '', email: '', resume: '' })
  const [applying, setApplying] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()
  const user = getCurrentUser()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [jRes, aRes] = await Promise.all([
        getPortalJobs(),
        user?.role === 'candidate' ? getMyApplications() : Promise.resolve({ data: { data: [] } })
      ])
      setJobs(jRes.data.data)
      setMyApps(aRes.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      setApplyForm(prev => ({ 
        ...prev, 
        name: user.full_name || user.username || '', 
        email: user.email || user.username || '' 
      }))
    }
  }, [user])

  const validate = () => {
    const errors = {}
    // More permissive regex to support query params (?), anchors (#), and various symbols common in cloud links
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i
    
    if (!applyForm.resume) {
      errors.resume = 'Resume link is required'
    } else if (!urlPattern.test(applyForm.resume)) {
      errors.resume = 'Please enter a valid URL (e.g., Google Drive, Dropbox, or PDF link)'
    }
    
    setFormErrors(errors)
    const isValid = Object.keys(errors).length === 0
    if (!isValid) console.warn('Validation failed:', errors)
    return isValid
  }

  const handleApply = async (e) => {
    e.preventDefault()
    console.log('handleApply triggered')
    
    if (!user) {
      console.log('No user found, redirecting to login')
      navigate('/login?reason=apply')
      return
    }

    if (!validate()) {
      console.log('Validation failed')
      return
    }
    
    if (!showApplyModal?._id) {
      console.error('No job selected')
      return
    }

    try {
      console.log('Starting application submission for job:', showApplyModal._id)
      setApplying(showApplyModal._id)
      const res = await applyForJob({ job_id: showApplyModal._id, ...applyForm })
      console.log('Submission response:', res.data)
      
      setSuccessMsg('🚀 Application submitted successfully!')
      
      // Cleanup
      setTimeout(() => {
        setSuccessMsg('')
        setShowApplyModal(null)
        setApplyForm(prev => ({ ...prev, resume: '' }))
        setFormErrors({})
        fetchData()
      }, 2500)
    } catch (err) {
      console.error('Submission failed:', err)
      const errorMsg = err.response?.data?.detail || 'Failed to submit application. Please check your connection and try again.'
      setFormErrors({ submit: errorMsg })
      alert('⚠️ ' + errorMsg) // Fallback alert for immediate feedback
    } finally {
      setApplying(null)
    }
  }

  const isApplied = (jobId) => myApps.some(app => app.job_id === jobId)

  const STAGE_COLORS = { 
    Applied: 'info', 
    Shortlisted: 'warning', 
    Interviewed: 'primary', 
    Hired: 'success', 
    Rejected: 'danger' 
  }

  return (
    <div className="public-container page-fade-in" style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      {successMsg && (
        <div className="toast success show glass" style={{ position: 'fixed', top: 24, right: 24, zIndex: 100000 }}>
          {successMsg}
        </div>
      )}

      <header style={{ textAlign: 'center', marginBottom: 60 }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>
          {view === 'available' ? 'Find Your Dream Career' : 'My Job Applications'}
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-muted)' }}>
          {view === 'available' ? 'Join our team of innovators and shape the future.' : 'Track the status of your submitted applications.'}
        </p>
        
        {user?.role === 'candidate' && (
          <div className="view-toggle" style={{ marginTop: 24 }}>
            <button className={view === 'available' ? 'active' : ''} onClick={() => setView('available')}>Available Jobs</button>
            <button className={view === 'applied' ? 'active' : ''} onClick={() => setView('applied')}>My Applications ({myApps.length})</button>
          </div>
        )}
      </header>

      {loading ? (
        <div className="dashboard-grid">
          {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 250 }}></div>)}
        </div>
      ) : view === 'available' ? (
        <div className="dashboard-grid">
          {jobs.length === 0 ? (
            <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No open positions at the moment. Check back later!</p>
          ) : (
            jobs.map(job => (
              <div key={job._id} className="card job-card-public glass">
                <div className="job-badge">{job.department}</div>
                <h3 className="job-title">{job.title}</h3>
                <div className="job-meta">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary || 'Competitive'}</span>
                  <span>⏱️ {job.type}</span>
                </div>
                <p className="job-desc">{job.description?.substring(0, 150) || 'No description provided.'}...</p>
                <div className="job-tags" style={{ marginBottom: 20 }}>
                  {(job.required_skills || "").split(',').map(tag => (
                    <span key={tag} className="skill-tag">{tag.trim()}</span>
                  ))}
                </div>
                <button 
                  className={isApplied(job._id) ? "btn-outline" : "btn-primary"} 
                  style={{ width: '100%' }}
                  onClick={() => !isApplied(job._id) && setShowApplyModal(job)}
                  disabled={applying === job._id || isApplied(job._id)}
                >
                  {applying === job._id ? 'Applying...' : isApplied(job._id) ? '✅ Already Applied' : 'View Details & Apply'}
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="table-wrapper card glass">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myApps.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40 }}>You haven't applied to any jobs yet.</td></tr>
              ) : (
                myApps.map(app => (
                  <tr key={app._id}>
                    <td style={{ fontWeight: 700 }}>{app.job_title}</td>
                    <td>{app.applied_date}</td>
                    <td>
                      <span className={`status-badge ${STAGE_COLORS[app.stage] || 'info'}`}>
                        <span className="status-dot"></span>{app.stage}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => navigate('/candidate/dashboard')}>View Updates</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Modal */}
      {showApplyModal && (
        <div className="modal-overlay open" onClick={() => { setShowApplyModal(null); setFormErrors({}); }}>
          <div className="modal glass" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="modal-header">
              <div>
                <h3>Apply for {showApplyModal.title}</h3>
                <p style={{ opacity: 0.7 }}>{showApplyModal.department} · {showApplyModal.location}</p>
              </div>
              <button className="modal-close" onClick={() => { setShowApplyModal(null); setFormErrors({}); }}>✕</button>
            </div>
            <form onSubmit={handleApply} className="emp-form" style={{ padding: '24px 32px' }}>
              {formErrors.submit && (
                <div className="auth-error" style={{ marginBottom: 20 }}>
                  <span>⚠️</span> {formErrors.submit}
                </div>
              )}
              
              <div className="form-grid" style={{ gap: 20 }}>
                <div className="form-group">
                  <label style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>FULL NAME</label>
                  <input value={applyForm.name} readOnly style={{ background: 'rgba(255,255,255,0.03)', cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>EMAIL ADDRESS</label>
                  <input type="email" value={applyForm.email} readOnly style={{ background: 'rgba(255,255,255,0.03)', cursor: 'not-allowed' }} />
                </div>
                <div className="form-group full-width">
                  <label style={{ color: formErrors.resume ? 'var(--danger)' : 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>
                    RESUME LINK (GOOGLE DRIVE / DROPBOX / PDF)
                  </label>
                  <input 
                    type="text"
                    className={formErrors.resume ? 'error' : ''}
                    placeholder="e.g., https://drive.google.com/file/d/..." 
                    value={applyForm.resume} 
                    onChange={e => {
                      setApplyForm({...applyForm, resume: e.target.value});
                      if (formErrors.resume) setFormErrors({...formErrors, resume: null});
                    }} 
                    style={{ 
                      borderColor: formErrors.resume ? 'var(--danger)' : '',
                      transition: 'all 0.2s ease'
                    }}
                  />
                  {formErrors.resume && (
                    <span style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                      {formErrors.resume}
                    </span>
                  )}
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    💡 Tip: Make sure the link is public so our recruiters can view it.
                  </p>
                </div>
              </div>
              
              <div className="form-actions" style={{ marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => { setShowApplyModal(null); setFormErrors({}); }} style={{ borderRadius: 12 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={applying} style={{ borderRadius: 12, minWidth: 160 }}>
                  {applying ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="spinner" style={{ width: 14, height: 14 }}></span> Submitting...
                    </div>
                  ) : '🚀 Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
