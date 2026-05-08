import { useState, useEffect } from 'react'
import { getMyApplications, getMyInterviews, getCurrentUser } from '../services/api'

export default function CandidateDashboard() {
  const [apps, setApps] = useState([])
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getCurrentUser()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, intRes] = await Promise.all([getMyApplications(), getMyInterviews()])
        setApps(appRes.data.data)
        setInterviews(intRes.data.data)
      } catch (e) { } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  return (
    <div className="page-content page-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Welcome, {user.username}</h1>
          <p className="page-sub">Track your applications and upcoming interviews</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card" style={{ background: 'var(--primary-glow)' }}>
          <div className="stat-value">{apps.length}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="card stat-card" style={{ background: 'var(--success-light)' }}>
          <div className="stat-value">{apps.filter(a => a.status === 'Shortlisted').length}</div>
          <div className="stat-label">Shortlisted</div>
        </div>
        <div className="card stat-card" style={{ background: 'var(--warning-light)' }}>
          <div className="stat-value">{interviews.length}</div>
          <div className="stat-label">Upcoming Interviews</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header"><h3>My Applications</h3></div>
          <div className="table-wrapper">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40 }}>No applications yet. Go to Careers!</td></tr>
                ) : (
                  apps.map(a => (
                    <tr key={a._id}>
                      <td><div style={{ fontWeight: 700 }}>{a.job_title}</div></td>
                      <td>{a.applied_date}</td>
                      <td>
                        <span className={`status-badge ${a.status === 'Shortlisted' ? 'success' : a.status === 'Applied' ? 'primary' : 'danger'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td><button className="btn-icon">👁️</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Upcoming Interviews</h3></div>
          <div className="interview-list-small">
            {interviews.length === 0 ? (
              <p style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No interviews scheduled.</p>
            ) : (
              interviews.map(i => (
                <div key={i._id} className="small-notif-item" style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{i.type}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{i.date} at {i.time}</div>
                  <a href={i.meeting_link} target="_blank" rel="noreferrer" className="btn-join-meet" style={{ display: 'inline-block', marginTop: 8 }}>Join Meeting</a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
