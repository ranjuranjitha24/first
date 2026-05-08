import { useState, useEffect, useCallback } from 'react'
import { getCurrentUser, getAttendance, getAttendanceStats, attendanceCheck } from '../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6']

export default function Attendance() {
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState([])
  const [stats, setStats] = useState({ Present: 0, Absent: 0, Late: 0, 'On Leave': 0, totalHours: 0 })
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })
  const user = getCurrentUser() || {}

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
  }

  const fetchData = useCallback(async () => {
    if (!user.employee_id && user.role === 'employee') return;
    setLoading(true)
    try {
      const [res, statsRes] = await Promise.all([
        getAttendance(user.role === 'employee' ? { employee_id: user.employee_id } : {}),
        getAttendanceStats(user.role === 'employee' ? { employee_id: user.employee_id } : {})
      ])
      setAttendance(res.data?.data || [])
      setStats(statsRes.data?.data || {})
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user.employee_id, user.role])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAction = async (type) => {
    if (!user.employee_id) return showToast('User ID not found', 'error')
    try {
      const res = await attendanceCheck({ employee_id: user.employee_id, type })
      showToast(res.data.data.message)
      fetchData()
    } catch (e) {
      showToast(e.response?.data?.detail || 'Action failed', 'error')
    }
  }

  const chartData = [
    { name: 'Present', value: stats.Present || 0 },
    { name: 'Late', value: stats.Late || 0 },
    { name: 'Absent', value: stats.Absent || 0 },
    { name: 'On Leave', value: stats['On Leave'] || 0 },
  ].filter(d => d.value > 0)

  // Check if already checked in today
  const todayStr = new Date().toISOString().split('T')[0]
  const todayRecord = attendance.find(a => a.date === todayStr)
  const isCheckedIn = !!todayRecord
  const isCheckedOut = todayRecord?.check_out

  if (loading && attendance.length === 0) return (
    <div className="page-content">
      <div className="loading-state">⏳ Synchronizing attendance records...</div>
    </div>
  )

  return (
    <div className="page-content page-fade-in">
      {toast.show && (
        <div className={`toast show ${toast.type}`} style={{ position: 'fixed', top: 24, right: 24, zIndex: 10001 }}>
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Tracker</h1>
          <p className="page-sub">
            {user.role === 'employee' ? 'Manage your daily check-ins and hours' : 'Monitor company-wide presence'}
          </p>
        </div>
        {user.role === 'employee' && (
          <div className="header-actions">
            {!isCheckedIn ? (
              <button className="btn-primary" onClick={() => handleAction('check-in')}>⏰ Clock In</button>
            ) : !isCheckedOut ? (
              <button className="btn-secondary" onClick={() => handleAction('check-out')}>🚪 Clock Out</button>
            ) : (
              <button className="btn-outline" disabled>✅ Completed for Today</button>
            )}
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-card-glow"></div>
          <div className="stat-info">
            <div className="stat-value">{(stats.Present || 0) + (stats.Late || 0)}</div>
            <div className="stat-label">Days Present</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-card-glow"></div>
          <div className="stat-info">
            <div className="stat-value">{stats.Late || 0}</div>
            <div className="stat-label">Late Logins</div>
          </div>
        </div>
        <div className="stat-card primary">
          <div className="stat-card-glow"></div>
          <div className="stat-info">
            <div className="stat-value">{(stats.totalHours || 0).toFixed(1)}h</div>
            <div className="stat-label">Total Hours</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Attendance Log</h3>
          </div>
          <div className="table-wrapper">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No records found</td></tr>
                ) : (
                  attendance.map((log, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{log.date}</td>
                      <td>
                        <span className={`status-badge ${log.status.toLowerCase().replace(' ', '-')}`}>
                          <span className="status-dot"></span>
                          {log.status}
                        </span>
                      </td>
                      <td>{log.check_in || '--'}</td>
                      <td>{log.check_out || '--'}</td>
                      <td>{log.work_hours > 0 ? `${log.work_hours}h` : '--'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Status Analytics</h3>
          </div>
          <div style={{ padding: '20px', height: 300 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}
                    itemStyle={{ color: 'var(--text)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%' }}>
                <p>No data to visualize</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
