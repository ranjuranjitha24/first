import { useState, useEffect } from 'react'
import { getPortalStats, getMyInterviews } from '../services/api'

export default function CandidateDashboard() {
  const [stats, setStats] = useState({ totalApplications: 0, shortlisted: 0, upcomingInterviews: 0 })
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, iRes] = await Promise.all([getPortalStats(), getMyInterviews()])
        setStats(sRes.data.data)
        setInterviews(iRes.data.data)
      } catch (e) {
        console.error("Failed to fetch dashboard data", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="page-content page-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, Candidate! 👋</h1>
          <p className="page-sub">Track your applications and upcoming interviews</p>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-grid">
          {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 120 }}></div>)}
        </div>
      ) : (
        <div className="dashboard-grid">
          <div className="stat-card glass">
            <div className="stat-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>📄</div>
            <div className="stat-info">
              <span className="stat-label">Total Applications</span>
              <h2 className="stat-value">{stats.totalApplications}</h2>
            </div>
          </div>
          <div className="stat-card glass">
            <div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107' }}>⭐</div>
            <div className="stat-info">
              <span className="stat-label">Shortlisted</span>
              <h2 className="stat-value">{stats.shortlisted}</h2>
            </div>
          </div>
          <div className="stat-card glass">
            <div className="stat-icon" style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}>🗓️</div>
            <div className="stat-info">
              <span className="stat-label">Upcoming Interviews</span>
              <h2 className="stat-value">{stats.upcomingInterviews}</h2>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-sections" style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        <div className="card glass">
          <div className="card-header">
            <h3>Recent Interviews</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="skeleton" style={{ height: 200 }}></div>
            ) : interviews.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🧘</div>
                <p>No interviews scheduled yet. Keep applying!</p>
              </div>
            ) : (
              <div className="interview-list">
                {interviews.map(i => (
                  <div key={i._id} className="interview-item-card">
                    <div className="interview-date">
                      <span className="day">{new Date(i.date).getDate()}</span>
                      <span className="month">{new Date(i.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="interview-details">
                      <h4>{i.job_title || 'Technical Interview'}</h4>
                      <p>🕒 {i.time} | 👤 {i.interviewer_name || 'HR Manager'}</p>
                    </div>
                    <button 
                      className="btn-primary-small"
                      onClick={() => window.open(i.meeting_link || '#', '_blank')}
                      disabled={!i.meeting_link}
                    >
                      Join Meeting
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card glass">
          <div className="card-header">
            <h3>Hiring Process</h3>
          </div>
          <div className="card-body">
            <div className="hiring-steps">
              {[
                { step: 1, title: 'Apply', desc: 'Submit your resume for open roles.' },
                { step: 2, title: 'Screening', desc: 'HR reviews your profile and skills.' },
                { step: 3, title: 'Interview', desc: 'Video call with the technical team.' },
                { step: 4, title: 'Offer', desc: 'Welcome to the team!' }
              ].map(s => (
                <div key={s.step} className="hiring-step-item">
                  <div className="step-num">{s.step}</div>
                  <div className="step-content">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
