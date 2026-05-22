import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { getEmployees } from '../services/api'
import EmployeeList from '../components/EmployeeList'
import EmployeeForm from '../components/EmployeeForm'
import InterviewForm from '../components/InterviewForm'
import { toast } from 'sonner'
import { PageWrapper } from '../components/ui/PageWrapper'
import { Card } from '../components/ui/Card'
import { SkeletonLoader } from '../components/ui/SkeletonLoader'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Plus } from 'lucide-react'

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
    toast.success(editEmp ? 'Employee details updated!' : 'New employee onboarded!')
    fetchEmployees()
  }

  return (
    <PageWrapper>
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
          <Button onClick={handleAdd} icon={Plus}>Add Employee</Button>
        </div>
      </div>

      <Card>
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
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SkeletonLoader style={{ height: 40 }} />
            <SkeletonLoader style={{ height: 40 }} />
            <SkeletonLoader style={{ height: 40 }} />
            <SkeletonLoader style={{ height: 40 }} />
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
      </Card>

      {/* ── ADD/EDIT MODAL ── */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={editEmp ? 'Edit Employee' : 'Onboard Employee'}
        subtitle={editEmp ? 'Update team member information' : 'Add a new member to your team'}
        maxWidth={600}
      >
        <EmployeeForm 
          employee={editEmp} 
          onSave={handleSaved} 
          onCancel={() => setShowModal(false)} 
        />
      </Modal>

      {scheduleEmp && (
        <Modal 
          isOpen={true} 
          onClose={() => setScheduleEmp(null)}
          title="Schedule Interview"
          maxWidth={600}
        >
          <InterviewForm
            employees={employees}
            preselectedEmployee={scheduleEmp}
            onSave={() => { setScheduleEmp(null); toast.success('Interview scheduled!') }}
            onClose={() => setScheduleEmp(null)}
          />
        </Modal>
      )}
    </PageWrapper>
  )
}
