import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { exportUserPDF } from '../../lib/exportPDF'

const fmt  = n => Number(n || 0).toLocaleString('en-IN')
const fmtDate = d => d ? d.split('-').reverse().join('/') : '—'
const timeAgo = (dateStr) => {
  if (!dateStr) return 'Never'
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 30) return `${diff}d ago`
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`
  return `${Math.floor(diff / 365)}y ago`
}

export default function AdminDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState({})
  const [pdfLoading, setPdfLoading]       = useState({})
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    api.get('/admin/dashboard').then(r => { setData(r.data); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const updateRole = async (userId, newRole, userName) => {
    if (!confirm(`${newRole === 'admin' ? 'Promote' : 'Demote'} ${userName} to ${newRole}?`)) return
    setActionLoading(p => ({ ...p, [userId]: 'role' }))
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      toast.success(`${userName} is now ${newRole}`)
      load()
    } catch { toast.error('Failed to update role') }
    finally { setActionLoading(p => ({ ...p, [userId]: null })) }
  }

  const deleteUser = async (userId, userName) => {
    if (!confirm(`⚠️ Permanently delete ${userName}? This cannot be undone.`)) return
    setActionLoading(p => ({ ...p, [userId]: 'delete' }))
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success(`${userName} deleted`)
      load()
    } catch { toast.error('Failed to delete user') }
    finally { setActionLoading(p => ({ ...p, [userId]: null })) }
  }

  const downloadPDF = async (userId, userName) => {
    setPdfLoading(p => ({ ...p, [userId]: true }))
    try {
      const res = await api.get(`/admin/users/${userId}/full`)
      exportUserPDF(res.data)
      toast.success(`PDF exported for ${userName}`)
    } catch { toast.error('Failed to generate PDF') }
    finally { setPdfLoading(p => ({ ...p, [userId]: false })) }
  }

  const exportCSV = () => {
    if (!data) return
    const headers = ['Name', 'Email', 'Role', 'Joined', 'Total Entries', 'Last Active', 'Udhar Pending']
    const rows = data.users.map(u => [
      u.name, u.email, u.role,
      fmtDate(u.created_at?.slice(0, 10)),
      u.total_entries,
      u.last_active || 'Never',
      u.udhar_pending
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported users.csv')
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /> Loading…</div>

  const filtered = data.users.filter(u => {
    const matchRole   = roleFilter === 'all' || u.role === roleFilter
    const matchSearch = !search.trim() ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <div>
      <div className="page-header fade-up">
        <div>
          <div className="page-title">👑 Admin Dashboard</div>
          <div className="page-subtitle">Platform overview and user management</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
          ↓ Export CSV
        </button>
      </div>

      <div className="stat-grid fade-up fade-up-1">
        <div className="stat-card accent">
          <div className="stat-label">Total Users</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{data.total_users}</div>
          <div className="stat-sub">Registered accounts</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">New This Month</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{data.new_this_month}</div>
          <div className="stat-sub">Signups this month</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Total Entries</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{data.total_entries}</div>
          <div className="stat-sub">Platform-wide transactions</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Users w/ Pending Udhar</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>{data.users_with_udhar}</div>
          <div className="stat-sub">Have unpaid udhar</div>
        </div>
      </div>

      <div className="card fade-up fade-up-2">
        <div className="card-header">
          <div className="card-title">👥 All Users</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="tab-group">
              {[['all', 'All'], ['user', 'Users'], ['admin', 'Admins']].map(([v, l]) => (
                <button key={v} className={`tab-btn ${roleFilter === v ? 'active' : ''}`} onClick={() => setRoleFilter(v)}>{l}</button>
              ))}
            </div>
            <input
              className="search-input"
              placeholder="🔍 Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 160 }}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Entries</th>
              <th style={{ textAlign: 'right' }}>Udhar Pending</th>
              <th>Last Active</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const busy = actionLoading[u.id]
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: u.role === 'admin'
                          ? 'linear-gradient(135deg,var(--accent),var(--accent2))'
                          : 'linear-gradient(135deg,var(--blue),#2563eb)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: '#fff',
                        flexShrink: 0
                      }}>
                        {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>

                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{u.email}</td>

                  <td>
                    <span className={`chip ${u.role === 'admin' ? 'chip-expense' : 'chip-income'}`}>
                      {u.role === 'admin' ? '👑 Admin' : '· User'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <span className="amount" style={{ color: 'var(--text-dim)' }}>{u.total_entries}</span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <span className="amount" style={{ color: u.udhar_pending > 0 ? 'var(--yellow)' : 'var(--muted)' }}>
                      {u.udhar_pending > 0 ? `₹${fmt(u.udhar_pending)}` : '—'}
                    </span>
                  </td>

                  <td style={{ color: 'var(--muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {timeAgo(u.last_active)}
                  </td>

                  <td style={{ color: 'var(--muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {fmtDate(u.created_at?.slice(0, 10))}
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        title="View full data"
                      >
                        View →
                      </button>

                      {u.role === 'user' ? (
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                          disabled={!!busy}
                          onClick={() => updateRole(u.id, 'admin', u.name)}
                          title="Promote to Admin"
                        >
                          {busy === 'role' ? '…' : '↑ Admin'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--blue-dim)', border: '1px solid var(--blue)', color: 'var(--blue)' }}
                          disabled={!!busy}
                          onClick={() => updateRole(u.id, 'user', u.name)}
                          title="Demote to User"
                        >
                          {busy === 'role' ? '…' : '↓ User'}
                        </button>
                      )}

                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--red-dim)', border: '1px solid #f43f5e30', color: '#f43f5e' }}
                        disabled={pdfLoading[u.id]}
                        onClick={() => downloadPDF(u.id, u.name)}
                        title="Export as PDF"
                      >
                        {pdfLoading[u.id] ? '…' : '↓ PDF'}
                      </button>

                      <button
                        className="btn btn-danger btn-icon"
                        disabled={!!busy}
                        onClick={() => deleteUser(u.id, u.name)}
                        title="Delete user"
                      >
                        {busy === 'delete' ? '…' : '🗑'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty">
            <div className="empty-icon">👤</div>
            No users found.
          </div>
        )}
      </div>
    </div>
  )
}
