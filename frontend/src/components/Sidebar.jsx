import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import { getCurrentUser } from '../services/api'

const allNavItems = [
  // HR/Admin
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard',       roles: ['admin', 'hr'] },
  { path: '/employees',       icon: '👥', label: 'Employees',       roles: ['admin', 'hr'] },
  { path: '/jobs',            icon: '💼', label: 'Job Postings',     roles: ['admin', 'hr'] },
  { path: '/interviews',      icon: '📅', label: 'Interviews',      roles: ['admin', 'hr'] },
  { path: '/analytics',       icon: '📈', label: 'Analytics',       roles: ['admin', 'hr'] },
  { path: '/attendance',      icon: '⏰', label: 'Attendance',      roles: ['admin', 'hr'] },
  { path: '/payroll',         icon: '💰', label: 'Payroll',         roles: ['admin', 'hr'] },
  { path: '/leaves',          icon: '🌴', label: 'Leave Approvals', roles: ['admin', 'hr'] },
  { path: '/settings',        icon: '⚙️', label: 'Settings',       roles: ['admin', 'hr'] },

  // Employee
  { path: '/employee/dashboard', icon: '📊', label: 'Dashboard',      roles: ['employee'] },
  { path: '/attendance',         icon: '⏰', label: 'Attendance',     roles: ['employee'] },
  { path: '/leaves',             icon: '🌴', label: 'Leave Requests', roles: ['employee'] },
  { path: '/reviews',            icon: '⭐', label: 'Reviews',        roles: ['employee'] },
  { path: '/profile',            icon: '👤', label: 'Profile',        roles: ['employee'] },

  // Candidate
  { path: '/candidate/dashboard', icon: '📊', label: 'Dashboard',       roles: ['candidate'] },
  { path: '/jobs/available',      icon: '🚀', label: 'Available Jobs',  roles: ['candidate'] },
  { path: '/applications',        icon: '📝', label: 'Applied Jobs',    roles: ['candidate'] },
  { path: '/interviews',          icon: '📅', label: 'Interview Status',roles: ['candidate'] },
  { path: '/profile',             icon: '👤', label: 'Profile',         roles: ['candidate'] },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const user = getCurrentUser() || {}
  const role = user.role || 'hr'

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', isCollapsed ? '88px' : '260px');
  }, [isCollapsed])

  const logout = () => {
    localStorage.removeItem('hr_token')
    navigate('/login')
  }

  const navItems = allNavItems.filter(i => i.roles.includes(role))
  const initial = (user.username || 'HR')[0].toUpperCase()

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
              <div className="user-name">{user.username || 'HR Manager'}</div>
              <div className="user-role">{role}</div>
            </div>
          )}
          <button className="logout-btn" onClick={logout} title="Logout">🚪</button>
        </div>
      </div>
    </aside>
  )
}
