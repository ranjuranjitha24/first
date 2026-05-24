import { useState, useEffect, useCallback } from 'react'
import { getCurrentUser, getAttendance, getAttendanceStats, attendanceCheck } from '../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { Users, LogOut, Clock, TrendingUp, CheckCircle2, Hourglass } from 'lucide-react'
import { PageWrapper } from '../components/ui/PageWrapper'
import { StatCard } from '../components/ui/StatCard'

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6']

export default function Attendance() {
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState([])
  const [stats, setStats] = useState({ Present: 0, Absent: 0, Late: 0, 'On Leave': 0, totalHours: 0, present_today: 0, absent_today: 0, attendance_percentage: 0 })
  const [filters, setFilters] = useState({ search: '', date: '' })
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })
  const [actionLoading, setActionLoading] = useState(false)
  const user = getCurrentUser() || {}
  const isHR = user.role !== 'employee'

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [res, statsRes] = await Promise.all([
        getAttendance({ 
          ...(isHR ? { search: filters.search, date: filters.date } : { employee_id: user.employee_id }) 
        }),
        getAttendanceStats(isHR ? {} : { employee_id: user.employee_id })
      ])
      setAttendance(res.data?.data || [])
      setStats(statsRes.data?.data || {})
    } catch (e) {
      console.error(e)
      showToast('Error syncing data', 'error')
    } finally {
      setLoading(false)
    }
  }, [user.employee_id, isHR, filters])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData()
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [fetchData])

  const handleAction = async (type) => {
    if (!user.employee_id) return showToast('User ID not found. Please relogin.', 'error')
    setActionLoading(true)
    try {
      const res = await attendanceCheck({ employee_id: user.employee_id, type })
      if (res.data.success) {
        showToast(res.data.data.message || `Successfully ${type.replace('-', ' ')}ed!`, 'success')
        fetchData()
      } else {
        showToast(res.data.message || 'Action rejected by server', 'error')
      }
    } catch (e) {
      showToast(e.response?.data?.detail || 'Network error occurred', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const chartData = isHR ? [
    { name: 'Present', value: stats.present_today || 0 },
    { name: 'Absent', value: stats.absent_today || 0 },
    { name: 'Late', value: stats.late_today || 0 },
  ].filter(d => d.value > 0) : [
    { name: 'Present', value: stats.Present || 0 },
    { name: 'Late', value: stats.Late || 0 },
    { name: 'Absent', value: stats.Absent || 0 },
  ].filter(d => d.value > 0)

  const todayStr = new Date().toISOString().split('T')[0]
  const myTodayRecord = attendance.find(a => a.date === todayStr && a.employee_id === user.employee_id)
  const isCheckedIn = !!myTodayRecord
  const isCheckedOut = myTodayRecord?.check_out

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <PageWrapper>
      {toast.show && (
        <div className={`toast show ${toast.type} glass`} style={{ position: 'fixed', top: 24, right: 24, zIndex: 10001 }}>
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-sub">
            {isHR ? 'Track team presence and daily activity analytics' : 'Manage your daily work hours and check-ins'}
          </p>
        </div>
        {!isHR && (
          <div className="header-actions">
            {!isCheckedIn ? (
              <button className="btn-primary" onClick={() => handleAction('check-in')} disabled={actionLoading}>
                {actionLoading ? '⏳ Processing...' : '⏰ Clock In'}
              </button>
            ) : !isCheckedOut ? (
              <button className="btn-secondary" onClick={() => handleAction('check-out')} disabled={actionLoading}>
                {actionLoading ? '⏳ Processing...' : '🚪 Clock Out'}
              </button>
            ) : (
              <div className="status-badge success" style={{ padding: '10px 20px' }}><span className="status-dot"></span> Shift Completed</div>
            )}
          </div>
        )}
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="stats-grid">
        {isHR ? (
          <>
            <motion.div variants={staggerItem}><StatCard icon={<Users size={20} />} value={stats.present_today || 0} label="Present Today" colorClass="success" /></motion.div>
            <motion.div variants={staggerItem}><StatCard icon={<LogOut size={20} />} value={stats.absent_today || 0} label="Absent Today" colorClass="danger" /></motion.div>
            <motion.div variants={staggerItem}><StatCard icon={<Clock size={20} />} value={stats.late_today || 0} label="Late Comers" colorClass="warning" /></motion.div>
            <motion.div variants={staggerItem}><StatCard icon={<TrendingUp size={20} />} value={stats.attendance_percentage || 0} label="Attendance Rate (%)" colorClass="primary" /></motion.div>
          </>
        ) : (
          <>
            <motion.div variants={staggerItem}><StatCard icon={<CheckCircle2 size={20} />} value={(stats.Present || 0) + (stats.Late || 0)} label="Days Present" colorClass="success" /></motion.div>
            <motion.div variants={staggerItem}><StatCard icon={<Clock size={20} />} value={stats.Late || 0} label="Late Logins" colorClass="warning" /></motion.div>
            <motion.div variants={staggerItem}><StatCard icon={<Hourglass size={20} />} value={stats.totalHours || 0} label="Total Work Hours" colorClass="primary" /></motion.div>
          </>
        )}
      </motion.div>

      <div className="dashboard-grid">
        <div className="card glass" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Attendance Log</h3>
            {isHR && (
              <div className="filters">
                <input 
                  type="text" 
                  placeholder="Search name..." 
                  className="filter-input"
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                />
                <input 
                  type="date" 
                  className="filter-input"
                  value={filters.date}
                  onChange={e => setFilters({ ...filters, date: e.target.value })}
                />
              </div>
            )}
          </div>
          <div className="table-wrapper">
            <table className="emp-table">
              <thead>
                <tr>
                  {isHR && <th>Employee</th>}
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
                ) : attendance.length === 0 ? (
                  <tr><td colSpan="6" className="empty-state"><div className="empty-icon">📁</div><p>No records found</p></td></tr>
                ) : (
                  attendance.map((log, i) => (
                    <tr key={log._id || i}>
                      {isHR && (
                        <td>
                          <div className="emp-name-cell">
                            <div className="avatar" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                              {log.employee_name?.[0] || 'E'}
                            </div>
                            <div>
                              <div className="emp-name-text">{log.employee_name}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>@{log.employee_username || 'unknown'}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td style={{ fontWeight: 600 }}>{log.date}</td>
                      <td>
                        <span className={`status-badge ${log.status.toLowerCase().replace(' ', '-')}`}>
                          <span className="status-dot"></span>
                          {log.status}
                        </span>
                      </td>
                      <td>{log.check_in || '--'}</td>
                      <td>{log.check_out || '--'}</td>
                      <td><div style={{ fontWeight: 700, color: 'var(--primary)' }}>{log.work_hours > 0 ? `${log.work_hours}h` : '--'}</div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card glass">
          <div className="card-header">
            <h3>Presence Analytics</h3>
          </div>
          <div style={{ padding: '20px', height: 320 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 16, border: 'none', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)', color: 'var(--text)' }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                  <Legend iconType="circle" verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>No activity data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
