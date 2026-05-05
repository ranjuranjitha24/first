import { deleteEmployee } from '../services/api'

const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2', '#be185d', '#7c3aed']

function getColor(name) {
  let h = 0; for (let c of name) h += c.charCodeAt(0)
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function getInitials(name) {
  return name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
}

export default function EmployeeList({ employees, onEdit, onSchedule, onRefresh }) {
  const handleDelete = async (id) => {
    if (!confirm('Delete this employee? Their interviews will also be removed.')) return
    try { await deleteEmployee(id); onRefresh() } catch (e) { alert('Error deleting employee') }
  }

  if (!employees.length) return (
    <div className="empty-state">
      <div className="empty-icon">👥</div>
      <p>No employees found.</p>
    </div>
  )

  return (
    <div className="table-wrapper">
      <table className="emp-table">
        <thead>
          <tr>
            <th>Name</th><th>Role</th><th>Experience</th><th>Skills</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => {
            const skills = emp.skills.split(',').map(s => s.trim()).filter(Boolean)
            return (
              <tr key={emp._id}>
                <td>
                  <div className="emp-name-cell">
                    <div className="avatar" style={{ background: getColor(emp.name) }}>{getInitials(emp.name)}</div>
                    <div>
                      <div className="emp-name-text">{emp.name}</div>
                      <div className="emp-email-text">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="role-badge">{emp.role}</span></td>
                <td>{emp.experience}</td>
                <td>
                  <div className="skills-cell">
                    {skills.slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}
                    {skills.length > 3 && <span className="skill-tag">+{skills.length - 3}</span>}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon edit" onClick={() => onEdit(emp)} title="Edit">✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(emp._id)} title="Delete">🗑️</button>
                    <button className="btn-icon schedule" onClick={() => onSchedule(emp)} title="Schedule Interview">📅</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
