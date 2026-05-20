import { useState, useEffect } from 'react'
import { getPortalStats, getMyInterviews, getCurrentUser } from '../services/api'

const HIRING_STEPS = [
  { step: 1, icon: '📄', title: 'Apply',      desc: 'Submit your resume for open roles.',         color: '#6366f1' },
  { step: 2, icon: '🔍', title: 'Screening',  desc: 'HR reviews your profile and skills.',         color: '#8b5cf6' },
  { step: 3, icon: '🎥', title: 'Interview',  desc: 'Video call with the technical team.',         color: '#06b6d4' },
  { step: 4, icon: '🎉', title: 'Offer',      desc: 'Get your offer letter. Welcome aboard!',      color: '#10b981' },
]

export default function CandidateDashboard() {
  const [stats, setStats]           = useState({ totalApplications: 0, shortlisted: 0, upcomingInterviews: 0 })
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading]       = useState(true)
  const user = getCurrentUser() || {}

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, iRes] = await Promise.all([getPortalStats(), getMyInterviews()])
        setStats(sRes.data.data)
        setInterviews(iRes.data.data)
      } catch (e) {
        console.error('Failed to fetch dashboard data', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="page-content page-fade-in">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user.full_name || 'Candidate'} 👋</h1>
          <p className="page-sub">Track your applications and upcoming interviews</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}>
        {[
          { icon: '📄', label: 'Total Applications', value: stats.totalApplications, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
          { icon: '⭐', label: 'Shortlisted',         value: stats.shortlisted,       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
          { icon: '🗓️', label: 'Upcoming Interviews', value: stats.upcomingInterviews,color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
        ].map(s => (
          <div key={s.label} className="stat-card glass" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '22px 24px' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{loading ? '–' : s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Interviews (full width) ── */}
      <div className="card glass" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <h3>📅 My Upcoming Interviews</h3>
        </div>
        <div style={{ padding: '8px 24px 24px' }}>
          {loading ? (
            <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
          ) : interviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🧘</div>
              <p>No interviews scheduled yet. Keep applying!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {interviews.map(i => (
                <div key={i._id} style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  transition: 'box-shadow 0.2s',
                }}>
                  <div style={{
                    minWidth: 52, height: 52, borderRadius: 12,
                    background: 'var(--primary-glow)', color: 'var(--primary)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 13, lineHeight: 1.2,
                  }}>
                    <span style={{ fontSize: 20 }}>{new Date(i.date).getDate()}</span>
                    <span style={{ fontWeight: 500, opacity: 0.8 }}>{new Date(i.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {i.job_title || 'Technical Interview'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🕒 {i.time} &nbsp;·&nbsp; 👤 {i.interviewer_name || 'HR Manager'}</div>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
                    onClick={() => window.open(i.meeting_link || '#', '_blank')}
                    disabled={!i.meeting_link}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Hiring Process — horizontal timeline ── */}
      <div className="card glass">
        <div className="card-header">
          <h3>🚀 Hiring Process</h3>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your journey from application to offer</span>
        </div>
        <div style={{ padding: '8px 32px 36px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: 480, position: 'relative' }}>
            {HIRING_STEPS.map((s, idx) => (
              <div key={s.step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {/* connector line */}
                {idx < HIRING_STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 28, left: '50%', width: '100%',
                    height: 2, background: `linear-gradient(90deg, ${s.color}88, ${HIRING_STEPS[idx+1].color}44)`,
                    zIndex: 0,
                  }} />
                )}
                {/* circle icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `${s.color}22`,
                  border: `2px solid ${s.color}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, zIndex: 1, marginBottom: 16,
                  boxShadow: `0 0 18px ${s.color}33`,
                  position: 'relative',
                }}>
                  {s.icon}
                  {/* step badge */}
                  <div style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 20, height: 20, borderRadius: '50%',
                    background: s.color, color: '#fff',
                    fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{s.step}</div>
                </div>
                {/* text */}
                <div style={{ textAlign: 'center', padding: '0 12px' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: s.color }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

