import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSession } from '../context/SessionContext'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'

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
  { path: '/admin/demo-requests', icon: '📋', label: 'Demo Requests', roles: ['admin', 'hr'] },
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
    <motion.aside 
      layout
      initial={false}
      animate={{ width: isCollapsed ? 88 : 260 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ flexShrink: 0 }}>HR</div>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }} 
              animate={{ opacity: 1, width: 'auto' }} 
              exit={{ opacity: 0, width: 0 }} 
              className="logo-text" 
              style={{ whiteSpace: 'nowrap' }}
            >
              RecruiterPro
            </motion.span>
          )}
        </AnimatePresence>
        <button 
          className="collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon" style={{ flexShrink: 0 }}>{item.icon}</span>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -10 }} 
                  className="nav-label" 
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="user-avatar" style={{ flexShrink: 0 }}>{initial}</div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }} 
                  animate={{ opacity: 1, width: 'auto' }} 
                  exit={{ opacity: 0, width: 0 }} 
                  className="user-info"
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                >
                  <div className="user-name">{displayName}</div>
                  <div className="user-role">{role}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!isCollapsed && (
            <motion.button 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="logout-btn" onClick={logout} title="Logout"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <LogOut size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
