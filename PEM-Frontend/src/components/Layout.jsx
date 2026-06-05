import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LABELS } from '../lib/utils'
import toast from 'react-hot-toast'

const userNav = [
  { to: '/dashboard',   icon: '▦',  label: 'Dashboard'   },
  { to: '/expenses',    icon: '↓',  label: LABELS.expense },
  { to: '/income',      icon: '↑',  label: LABELS.income  },
  { to: '/udhar',       icon: '⇌',  label: 'Udhar Book'  },
  { to: '/all-entries', icon: '☰',  label: 'All Entries' },
  { to: '/reports',     icon: '↗',  label: 'Reports'     },
]
const adminNav = [
  { to: '/dashboard',   icon: '▦',  label: 'Dashboard'   },
  { to: '/admin',       icon: '◎',  label: 'All Users'   },
  { to: '/udhar',       icon: '⇌',  label: 'Udhar Book'  },
  { to: '/all-entries', icon: '☰',  label: 'All Entries' },
  { to: '/reports',     icon: '↗',  label: 'My Reports'  },
]

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const nav = user?.role === 'admin' ? adminNav : userNav

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="layout-root">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>₹</span>
          <span>PEM</span>
        </div>

        <nav style={{ flex: 1 }}>
          {nav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/dashboard' || n.to === '/admin'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', marginBottom: 8, justifyContent: 'center', gap: 8 }}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Profile link */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `user-info${isActive ? ' user-info--active' : ''}`
            }
            style={{ textDecoration: 'none', display: 'flex', cursor: 'pointer' }}
            title="My Profile"
          >
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div>
              <div className="user-name">{user?.name?.split(' ')[0]}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </NavLink>

          <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={handleLogout}>
            ⏻ Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}