import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LABELS } from '../lib/utils'
import toast from 'react-hot-toast'

const userNav = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/expenses', icon: '💸', label: LABELS.expense },
  { to: '/income', icon: '💰', label: LABELS.income },
  { to: '/udhar', icon: '🤝', label: 'Udhar Book' },
  { to: '/all-entries', icon: '📋', label: 'All Entries' },
  { to: '/reports', icon: '📈', label: 'Reports' },
]
const adminNav = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin', icon: '👥', label: 'All Users' },
  { to: '/udhar', icon: '🤝', label: 'Udhar Book' },
  { to: '/all-entries', icon: '📋', label: 'All Entries' },
  { to: '/reports', icon: '📈', label: 'My Reports' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nav = user?.role === 'admin' ? adminNav : userNav

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 60, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Baloo 2'", fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>📒 {LABELS.appName}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ background: user?.role === 'admin' ? '#eab30811' : 'var(--surface2)', border: `1px solid ${user?.role === 'admin' ? '#eab30855' : 'var(--border)'}`, color: user?.role === 'admin' ? 'var(--yellow)' : 'var(--muted)', borderRadius: 20, padding: '3px 12px', fontSize: '.74rem', fontWeight: 700 }}>{user?.role?.toUpperCase()}</span>
          <span style={{ fontWeight: 700, fontSize: '.9rem' }}>{user?.name}</span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ width: 210, background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to==='/dashboard'||n.to==='/admin'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 10, fontSize: '.9rem', fontWeight: 600, cursor: 'pointer',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                background: isActive ? '#f9731622' : 'transparent',
                textDecoration: 'none', transition: '.2s'
              })}>
              <span>{n.icon}</span>{n.label}
            </NavLink>
          ))}
        </div>
        <div style={{ flex: 1, padding: '30px 34px', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}