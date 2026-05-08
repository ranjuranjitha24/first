import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { getEmployees } from '../services/api'
import EmployeeList from '../components/EmployeeList'
import EmployeeForm from '../components/EmployeeForm'
import InterviewForm from '../components/InterviewForm'

const ROLES = ['Frontend Developer','Backend Developer','UI/UX Designer','Product Manager','Data Analyst','DevOps Engineer','QA Engineer','HR Manager']

export default function Employees() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialSearch = queryParams.get('search') || ''

  const [employees, setEmployees] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState(initialSearch)
  const [roleFilter, setRoleFilter] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'cards'
  const [showModal, setShowModal] = useState(false)
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

  const handleEdit = (emp) => { setEditEmp(emp); setShowModal(true) }
  const handleAdd = () => { setEditEmp(null); setShowModal(true) }

  const handleSaved = () => {
    setShowModal(false); setEditEmp(null)
    showToast(editEmp ? '✅ Employee details updated!' : '✅ New employee onboarded!')
    fetchEmployees()
  }

  return (
    <div className="page-content page-fade-in">
      {toast && <div className="toast show success" style={{position:'fixed', top:24, right:24, zIndex:10001}}>{toast}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-sub">Directory of all team members and their roles</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>Table</button>
            <button className={viewMode === 'cards' ? 'active' : ''} onClick={() => setViewMode('cards')}>Cards</button>
          </div>
          <button className="btn-primary" onClick={handleAdd}>➕ Add Employee</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Team Directory ({filtered.length})</h3>
          <div className="filters">
            <input
              className="filter-input"
              placeholder="🔍 Search name, email, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 280 }}
            />
            <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state" style={{ padding: 60 }}>
            <div className="skeleton-text skeleton" style={{ width: '100%', height: 40, marginBottom: 12 }}></div>
            <div className="skeleton-text skeleton" style={{ width: '100%', height: 40, marginBottom: 12 }}></div>
            <div className="skeleton-text skeleton" style={{ width: '100%', height: 40 }}></div>
          </div>
        ) : (
          <EmployeeList 
            employees={filtered} 
            onEdit={handleEdit} 
            onSchedule={emp => setScheduleEmp(emp)} 
            onRefresh={fetchEmployees}
            viewMode={viewMode}
          />
        )}
      </div>

      {/* ── ADD/EDIT MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editEmp ? '✏️ Edit Employee' : '➕ Onboard Employee'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <EmployeeForm 
                employee={editEmp} 
                onSave={handleSaved} 
                onCancel={() => setShowModal(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {scheduleEmp && (
        <InterviewForm
          employees={employees}
          preselectedEmployee={scheduleEmp}
          onSave={() => { setScheduleEmp(null); showToast('📅 Interview scheduled!') }}
          onClose={() => setScheduleEmp(null)}
        />
      )}
    </div>
  )
}
