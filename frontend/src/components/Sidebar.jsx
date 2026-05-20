import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import { useSession } from '../context/SessionContext'

const allNavItems = [
  // Shared / Role-specific
  { path: '/admin/dashboard',    icon: '📊', label: 'Dashboard',       roles: ['admin', 'hr'] },
  { path: '/employee/dashboard', icon: '📊', label: 'Dashboard',       roles: ['employee'] },
  { path: '/candidate/dashboard',icon: '📊', label: 'Dashboard',       roles: ['candidate'] },
  
  { path: '/employees',       icon: '👥', label: 'Employees',       roles: ['admin', 'hr'] },
  { path: '/jobs',            icon: '💼', label: 'Job Postings',     roles: ['admin', 'hr'] },
  { path: '/leaves',          icon: '🌴', label: 'Leaves',          roles: ['admin', 'hr', 'employee'] },
  { path: '/interviews',      icon: '📅', label: 'Interviews',      roles: ['admin', 'hr', 'employee', 'candidate'] },
  { path: '/attendance',      icon: '⏰', label: 'Attendance',      roles: ['admin', 'hr', 'employee'] },
  { path: '/meetings',        icon: '🤝', label: 'Meetings',         roles: ['admin', 'hr', 'employee'] },
  { path: '/payroll',         icon: '💰', label: 'Payroll',         roles: ['admin', 'hr', 'employee'] },
  { path: '/analytics',       icon: '📈', label: 'Analytics',       roles: ['admin', 'hr'] },
  { path: '/reviews',         icon: '⭐', label: 'Reviews',        roles: ['employee'] },
  
  // Candidate Specific
  { path: '/jobs/available',  icon: '🚀', label: 'Available Jobs',  roles: ['candidate'] },
  { path: '/applications',    icon: '📝', label: 'Applied Jobs',    roles: ['candidate'] },
  
  // Shared Bottom
  { path: '/profile',         icon: '👤', label: 'Profile',         roles: ['admin', 'hr', 'employee', 'candidate'] },
  { path: '/settings',        icon: '⚙️', label: 'Settings',       roles: ['admin', 'hr'] },
]

export default function Sidebar() {
  const { user: sessionUser, logout: sessionLogout } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const user = sessionUser || {}
  const role = user.role || 'hr'

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', isCollapsed ? '88px' : '260px');
  }, [isCollapsed])

  const logout = () => sessionLogout('manual')

  const navItems = allNavItems.filter(i => i.roles.includes(role))
  const displayName = user.full_name || user.username || 'HR Manager'
  const initial = displayName[0].toUpperCase()

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">HR</div>
        {!isCollapsed && <span className="logo-text">RecruiterPro</span>}
        <button 
          className="collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            title={isCollapsed ? item.label : ''}>
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-theme-toggle" style={{ padding: isCollapsed ? '10px 0' : '10px 24px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
          {!isCollapsed && <span className="nav-label" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Theme</span>}
          <ThemeToggle collapsed={isCollapsed} />
        </div>
        <div className="sidebar-footer">
          <div className="user-avatar">{initial}</div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-role">{role}</div>
            </div>
          )}
          <button className="logout-btn" onClick={logout} title="Logout">🚪</button>
        </div>
      </div>
    </aside>
  )
}
