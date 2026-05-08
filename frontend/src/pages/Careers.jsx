import { useState, useEffect } from 'react'
import { getPortalJobs, applyForJob, getCurrentUser } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Careers() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
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

  const handleApply = async (jobId) => {
    if (!user) {
      alert('Please login as a candidate to apply.')
      navigate('/login')
      return
    }
    
    if (user.role !== 'candidate') {
      alert('Only candidates can apply for jobs.')
      return
    }

    try {
      setApplying(jobId)
      await applyForJob({ job_id: jobId, resume: 'https://example.com/resume.pdf' })
      alert('Applied successfully! Track your status in your dashboard.')
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
                <div className="job-badge">{job.category || 'Tech'}</div>
                <h3 className="job-title">{job.title}</h3>
                <div className="job-meta">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary_range}</span>
                  <span>⏱️ {job.type}</span>
                </div>
                <p className="job-desc">{job.description.substring(0, 120)}...</p>
                <div className="job-tags">
                  {(job.requirements || "").split(',').slice(0,3).map(tag => (
                    <span key={tag} className="skill-tag">{tag}</span>
                  ))}
                </div>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: 20 }}
                  onClick={() => handleApply(job._id)}
                  disabled={applying === job._id}
                >
                  {applying === job._id ? 'Applying...' : 'Apply Now'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
