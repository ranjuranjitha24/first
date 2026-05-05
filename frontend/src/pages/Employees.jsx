import { useState, useEffect, useCallback } from 'react'
import { getEmployees } from '../services/api'
import EmployeeList from '../components/EmployeeList'
import EmployeeForm from '../components/EmployeeForm'
import InterviewForm from '../components/InterviewForm'

const ROLES = ['Frontend Developer','Backend Developer','UI/UX Designer','Product Manager','Data Analyst','DevOps Engineer','QA Engineer','HR Manager']

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editEmp, setEditEmp] = useState(null)
  const [scheduleEmp, setScheduleEmp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getEmployees({ search, role: roleFilter })
      setEmployees(res.data.data)
      setFiltered(res.data.data)
    } catch(e) { console.error(e) } finally { setLoading(false) }
  }, [search, roleFilter])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  const handleEdit = (emp) => { setEditEmp(emp); setShowForm(true) }
  const handleAdd = () => { setEditEmp(null); setShowForm(true) }

  const handleSaved = () => {
    setShowForm(false); setEditEmp(null)
    showToast(editEmp ? '✅ Employee updated!' : '✅ Employee added!')
    fetchEmployees()
  }

  const handleScheduled = () => {
    setScheduleEmp(null)
    showToast('📅 Interview scheduled!')
  }

  return (
    <div className="page-content">
      {toast && <div className="toast show success">{toast}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-sub">Manage your team members</p>
        </div>
        <button className="btn-primary" onClick={handleAdd}>➕ Add Employee</button>
      </div>

      {showForm && (
        <div className="card" style={{marginBottom:24}}>
          <div className="card-header">
            <h3>{editEmp ? 'Edit Employee' : 'Add New Employee'}</h3>
          </div>
          <div style={{padding:'20px 24px'}}>
            <EmployeeForm employee={editEmp} onSave={handleSaved} onCancel={() => { setShowForm(false); setEditEmp(null) }} />
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>All Employees ({filtered.length})</h3>
          <div className="filters">
            <input
              className="filter-input"
              placeholder="🔍 Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        {loading
          ? <div className="loading-state">⏳ Loading employees...</div>
          : <EmployeeList employees={filtered} onEdit={handleEdit} onSchedule={emp => setScheduleEmp(emp)} onRefresh={fetchEmployees} />
        }
      </div>

      {scheduleEmp && (
        <InterviewForm
          employees={employees}
          preselectedEmployee={scheduleEmp}
          onSave={handleScheduled}
          onClose={() => setScheduleEmp(null)}
        />
      )}
    </div>
  )
}
