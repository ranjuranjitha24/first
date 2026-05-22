import { useState } from 'react'
import { deleteEmployee } from '../services/api'
import { EmptyState } from './ui/EmptyState'
import { StatusBadge } from './ui/StatusBadge'
import { Users, Edit2, Trash2, Calendar } from 'lucide-react'
import { toast } from 'sonner'

const AVATAR_COLORS = ['#8b5cf6', '#a78bfa', '#6d28d9', '#4c1d95', '#c4b5fd']

function getColor(name) {
  let h = 0; for (let c of (name || '')) h += c.charCodeAt(0)
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function getInitials(name) {
  return (name || '?').split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
}

export default function EmployeeList({ employees, onEdit, onSchedule, onRefresh, viewMode = 'table' }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee? Their data will be permanently removed.')) return
    try { await deleteEmployee(id); toast.success('Employee removed'); onRefresh() } catch (e) { toast.error('Error deleting employee') }
  }

  if (!employees.length) return (
    <EmptyState 
      icon={Users} 
      title="No employees found" 
      description="We couldn't find any employees matching your current criteria." 
    />
  )

  const totalPages = Math.ceil(employees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEmps = employees.slice(startIndex, startIndex + itemsPerPage)

  const renderTable = () => (
    <div className="table-wrapper">
      <table className="emp-table">
        <thead>
          <tr>
            <th>Employee</th><th>Role & Dept</th><th>Status</th><th>Skills</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmps.map(emp => {
            const skills = (emp.skills || '').split(',').map(s => s.trim()).filter(Boolean)
            return (
              <tr key={emp._id}>
                <td>
                  <div className="emp-name-cell">
                    {emp.image_url ? (
                      <img src={emp.image_url} alt={emp.name} className="avatar" />
                    ) : (
                      <div className="avatar" style={{ background: getColor(emp.name) }}>{getInitials(emp.name)}</div>
                    )}
                    <div>
                      <div className="emp-name-text">{emp.name}</div>
                      <div className="emp-email-text">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="emp-role-text">{emp.role}</div>
                  <div className="emp-email-text">{emp.department || 'Engineering'}</div>
                </td>
                <td>
                  <StatusBadge status={emp.status || 'Active'} />
                </td>
                <td>
                  <div className="skills-cell">
                    {skills.slice(0, 2).map(s => <span key={s} className="skill-tag">{s}</span>)}
                    {skills.length > 2 && <span className="skill-tag">+{skills.length - 2}</span>}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon edit" onClick={() => onEdit(emp)}><Edit2 size={16} /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(emp._id)}><Trash2 size={16} /></button>
                    <button className="btn-icon schedule" onClick={() => onSchedule(emp)}><Calendar size={16} /></button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  const renderCards = () => (
    <div className="employee-cards">
      {paginatedEmps.map(emp => {
        const skills = (emp.skills || '').split(',').map(s => s.trim()).filter(Boolean)
        return (
          <div key={emp._id} className="employee-card card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
            <div className="card-status" style={{ position: 'absolute', top: 16, right: 16 }}>
              <StatusBadge status={emp.status || 'Active'} />
            </div>
            {emp.image_url ? (
              <img src={emp.image_url} alt={emp.name} className="card-avatar" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="card-avatar" style={{ background: getColor(emp.name) }}>{getInitials(emp.name)}</div>
            )}
            <div className="card-name">{emp.name}</div>
            <div className="card-role">{emp.role}</div>
            <div className="card-dept">{emp.department || 'Engineering'}</div>
            <div className="card-skills">
              {skills.slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}
            </div>
            <div className="card-actions" style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', borderTop: '1px solid var(--border)', paddingTop: 16, width: '100%' }}>
              <button className="btn-icon edit" onClick={() => onEdit(emp)}><Edit2 size={16} /></button>
              <button className="btn-icon delete" onClick={() => handleDelete(emp._id)}><Trash2 size={16} /></button>
              <button className="btn-icon schedule" onClick={() => onSchedule(emp)}><Calendar size={16} /></button>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div>
      {viewMode === 'table' ? renderTable() : renderCards()}
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(c => c - 1)}
          >
            ←
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i} 
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button 
            className="page-btn" 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(c => c + 1)}
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
