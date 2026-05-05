import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const allNavItems = [
  { path: '/dashboard',  icon: '📊', label: 'Dashboard',   roles: ['hr', 'employee'] },
  { path: '/employees',  icon: '👥', label: 'Employees',   roles: ['hr'] },
  { path: '/interviews', icon: '📅', label: 'Interviews',  roles: ['hr', 'employee'] },
  { path: '/jobs',       icon: '💼', label: 'Job Postings',roles: ['hr'] },
  { path: '/candidates', icon: '🎯', label: 'Candidates',  roles: ['hr'] },
  { path: '/leaves',     icon: '🌴', label: 'Leave Tracker',roles: ['hr', 'employee'] },
  { path: '/reviews',    icon: '⭐', label: 'Reviews',     roles: ['hr', 'employee'] },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => localStorage.getItem('hr_dark') === 'true')
  
  let user = {}
  try {
    user = JSON.parse(atob(localStorage.getItem('hr_token') || btoa('{}')) || '{}')
  } catch(e) {}
  
  const role = user.role || 'hr'

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('hr_dark', dark)
  }, [dark])

  const logout = () => {
    localStorage.removeItem('hr_token')
    navigate('/login')
  }

  const navItems = allNavItems.filter(i => i.roles.includes(role))
  const initial = (user.username || 'HR')[0].toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">HR</div>
        <span className="logo-text">RecruiterPro</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="dark-toggle" onClick={() => setDark(d => !d)}>
          {dark ? '☀️' : '🌙'} <span className="nav-label">{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <div className="sidebar-footer">
          <div className="user-avatar">{initial}</div>
          <div className="user-info">
            <div className="user-name" style={{maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              {user.username || 'HR Manager'}
            </div>
            <div className="user-role" style={{textTransform:'capitalize'}}>{role}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
        </div>
      </div>
    </aside>
  )
}
