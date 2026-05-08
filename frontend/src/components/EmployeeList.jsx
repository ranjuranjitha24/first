import { useState } from 'react'
import { deleteEmployee } from '../services/api'

const AVATAR_COLORS = ['#6366f1', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2', '#be185d', '#8b5cf6']
const STATUS_CLASSES = { Active: 'success', Inactive: 'warning', 'On Leave': 'info', Deactivated: 'danger' }

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
    try { await deleteEmployee(id); onRefresh() } catch (e) { alert('Error deleting employee') }
  }

  if (!employees.length) return (
    <div className="empty-state" style={{ padding: '60px 0' }}>
      <div className="empty-icon" style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
      <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>No employees found matching your criteria.</p>
    </div>
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
                  <span className={`status-badge ${STATUS_CLASSES[emp.status || 'Active']}`}>
                    <span className="status-dot"></span>
                    {emp.status || 'Active'}
                  </span>
                </td>
                <td>
                  <div className="skills-cell">
                    {skills.slice(0, 2).map(s => <span key={s} className="skill-tag">{s}</span>)}
                    {skills.length > 2 && <span className="skill-tag">+{skills.length - 2}</span>}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon edit" onClick={() => onEdit(emp)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(emp._id)}>🗑️</button>
                    <button className="btn-icon schedule" onClick={() => onSchedule(emp)}>📅</button>
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
          <div key={emp._id} className="employee-card">
            <div className="card-status">
              <span className={`status-badge ${STATUS_CLASSES[emp.status || 'Active']}`}>
                <span className="status-dot"></span>
              </span>
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
            <div className="card-actions">
              <button className="btn-icon edit" onClick={() => onEdit(emp)}>✏️</button>
              <button className="btn-icon delete" onClick={() => handleDelete(emp._id)}>🗑️</button>
              <button className="btn-icon schedule" onClick={() => onSchedule(emp)}>📅</button>
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
