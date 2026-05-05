import { useState, useEffect, useCallback } from 'react'
import { getInterviews, getEmployees, getCurrentUser } from '../services/api'
import InterviewList from '../components/InterviewList'
import InterviewForm from '../components/InterviewForm'

export default function Interviews() {
  const [interviews, setInterviews] = useState([])
  const [employees, setEmployees] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const user = getCurrentUser()
  const isHR = user && user.role !== 'employee'

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getInterviews(statusFilter ? { status: statusFilter } : {})
      setInterviews(res.data.data)
    } catch(e) { console.error('Failed to fetch interviews:', e) }

    if (isHR) {
      try {
        const res = await getEmployees()
        setEmployees(res.data.data)
      } catch(e) { console.error('Failed to fetch employees:', e) }
    }
    setLoading(false)
  }, [statusFilter, isHR])

  useEffect(() => { fetchData() }, [fetchData])

  const handleScheduled = () => {
    setShowForm(false)
    showToast('📅 Interview scheduled!')
    fetchData()
  }

  return (
    <div className="page-content">
      {toast && <div className="toast show success">{toast}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">{isHR ? 'Interviews' : 'My Interviews'}</h1>
          <p className="page-sub">{isHR ? 'Track and manage all interview schedules' : 'View your upcoming and past interviews'}</p>
        </div>
        {isHR && <button className="btn-primary" onClick={() => setShowForm(true)}>📅 New Interview</button>}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{isHR ? 'Interview Schedule' : 'My Schedule'} ({interviews.length})</h3>
          <div className="filters">
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        {loading
          ? <div className="loading-state">⏳ Loading interviews...</div>
          : <InterviewList interviews={interviews} onRefresh={fetchData} isHR={isHR} />
        }
      </div>

      {isHR && showForm && (
        <InterviewForm
          employees={employees}
          preselectedEmployee={null}
          onSave={handleScheduled}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
