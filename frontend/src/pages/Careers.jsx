import { useState, useEffect } from 'react'
import { getJobs, addCandidate } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Careers() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', experience: '', skills: '', resume_link: '' })
  const navigate = useNavigate()

  useEffect(() => {
    // Only fetch "Open" jobs
    getJobs({ status: 'Open' })
      .then(res => { setJobs(res.data.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addCandidate({ ...form, job_id: selectedJob._id, stage: 'Applied' })
      showToast('🎉 Application submitted successfully!')
      setSelectedJob(null)
      setForm({ name: '', email: '', phone: '', experience: '', skills: '', resume_link: '' })
    } catch (err) {
      showToast('❌ Error submitting application')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text)', padding: '40px 20px' }}>
      {toast && <div className="toast show success">{toast}</div>}
      
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div className="sidebar-logo" style={{ padding: 0 }}>
            <div className="logo-icon">HR</div>
            <span className="logo-text">RecruiterPro <span style={{fontWeight:300}}>Careers</span></span>
          </div>
          <button className="btn-outline" onClick={() => navigate('/login')}>Login</button>
        </header>

        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>Join Our Team</h1>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto' }}>
            We're looking for passionate individuals to join us. Explore our open positions below and apply to be part of our journey.
          </p>
        </div>

        {loading ? <div className="loading-state">⏳ Loading jobs...</div> : (
          jobs.length === 0 ? (
            <div className="empty-state" style={{ padding: 60 }}>
              <div className="empty-icon">🌟</div>
              <p>No open positions right now. Check back later!</p>
            </div>
          ) : (
            <div className="dashboard-grid">
              {jobs.map(j => (
                <div key={j._id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 20, margin: '0 0 8px 0' }}>{j.title}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{j.department} · {j.location}</div>
                    </div>
                    <span className="skill-tag" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa' }}>{j.type}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, flex: 1 }}>{j.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Exp: {j.experience}</div>
                    <button className="btn-primary" onClick={() => setSelectedJob(j)}>Apply Now</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: 500, padding: 0 }}>
            <div className="card-header" style={{ padding: '20px 24px' }}>
              <h3 style={{ margin: 0 }}>Apply for {selectedJob.title}</h3>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Full Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Experience *</label>
                  <input value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 3 Years" required />
                </div>
                <div className="form-group">
                  <label>Skills *</label>
                  <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js" required />
                </div>
                <div className="form-group full-width">
                  <label>Resume Link *</label>
                  <input type="url" value={form.resume_link} onChange={e => setForm({ ...form, resume_link: e.target.value })} placeholder="https://linkedin.com/in/..." required />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setSelectedJob(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
