import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

const fmt = n => Number(n||0).toLocaleString('en-IN')

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/admin/dashboard').then(r => { setData(r.data); setLoading(false) })
  }, [])

  if (loading) return <div className="empty">Loading...</div>

  const users = data.users.filter(u=>u.role==='user')

  return (
    <div>
      <div className="page-title">👑 Admin Dashboard</div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total Users</div><div className="stat-value" style={{color:'var(--accent)'}}>{data.total_users}</div></div>
        <div className="stat-card"><div className="stat-label">Platform Income</div><div className="stat-value" style={{color:'var(--green)'}}>₹{fmt(data.total_income)}</div></div>
        <div className="stat-card"><div className="stat-label">Platform Expense</div><div className="stat-value" style={{color:'var(--red)'}}>₹{fmt(data.total_expense)}</div></div>
        <div className="stat-card"><div className="stat-label">Udhar Pending</div><div className="stat-value" style={{color:'var(--yellow)'}}>₹{fmt(data.total_udhar_pending)}</div></div>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">👥 All Users</div><span style={{color:'var(--muted)',fontSize:'.85rem'}}>Click to view full detail</span></div>
        <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>
          {users.map(u=><tr key={u.id}>
            <td style={{fontWeight:700}}>{u.name}</td>
            <td style={{color:'var(--muted)'}}>{u.email}</td>
            <td><span className="chip chip-income">User</span></td>
            <td><button className="btn btn-secondary btn-sm" onClick={()=>navigate(`/admin/users/${u.id}`)}>View Full Data →</button></td>
          </tr>)}
        </tbody></table>
      </div>
    </div>
  )
}
