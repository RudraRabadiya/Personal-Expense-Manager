import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { fmt, fmtDate, LABELS } from '../../lib/utils'
import { exportUserPDF } from '../../lib/exportPDF'
import toast from 'react-hot-toast'

export default function AdminUserDetail() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [tab, setTab]         = useState('entries')
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    api.get(`/admin/users/${userId}/full`).then(r => { setData(r.data); setLoading(false) })
  }, [userId])

  const downloadPDF = async () => {
    setPdfLoading(true)
    try {
      exportUserPDF(data)
      toast.success('PDF exported!')
    } catch { toast.error('Failed to export PDF') }
    finally { setPdfLoading(false) }
  }

  if (loading) return <div className="empty">Loading user data...</div>

  const { profile, summary, entries, udhar } = data

  return (
    <div>
      <div style={{display:'flex',gap:10,marginBottom:18}}>
        <button className="btn btn-secondary btn-sm" onClick={()=>navigate('/admin')}>← Back to Users</button>
        <button className="btn btn-primary btn-sm" onClick={()=>navigate(`/admin/users/${userId}/reports`)}>📈 View Reports</button>
        <button
          className="btn btn-sm"
          style={{ background: 'var(--red-dim)', border: '1px solid #f43f5e40', color: '#f43f5e', marginLeft: 'auto' }}
          onClick={downloadPDF}
          disabled={pdfLoading}
        >
          {pdfLoading ? '⏳ Generating…' : '↓ Export PDF'}
        </button>
      </div>

      <div className="page-title">👤 {profile.name}</div>
      <div style={{color:'var(--muted)',fontSize:'.88rem',marginBottom:20}}>{profile.email}</div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total {LABELS.income}</div><div className="stat-value" style={{color:'var(--green)'}}>₹{fmt(summary.total_income)}</div></div>
        <div className="stat-card"><div className="stat-label">Total {LABELS.expense}</div><div className="stat-value" style={{color:'var(--red)'}}>₹{fmt(summary.total_expense)}</div></div>
        <div className="stat-card"><div className="stat-label">Net Balance</div><div className="stat-value" style={{color:summary.net_balance>=0?'var(--green)':'var(--red)'}}>₹{fmt(Math.abs(summary.net_balance))}</div></div>
        <div className="stat-card"><div className="stat-label">{LABELS.gave} (Baki)</div><div className="stat-value" style={{color:'var(--blue)'}}>₹{fmt(summary.udhar_gave_pending)}</div></div>
        <div className="stat-card"><div className="stat-label">{LABELS.got} (Baki)</div><div className="stat-value" style={{color:'var(--yellow)'}}>₹{fmt(summary.udhar_got_pending)}</div></div>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {['entries','udhar'].map(t=>(
          <button key={t} className={`btn btn-sm ${tab===t?'btn-primary':'btn-secondary'}`} onClick={()=>setTab(t)}>
            {t==='entries'?'💸 Entries':'🤝 Udhar'}
          </button>
        ))}
      </div>

      {tab==='entries' && <div className="card">
        {entries.length ? <table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th><th>Notes</th></tr></thead><tbody>
          {entries.map(e=><tr key={e.id}>
            <td>{fmtDate(e.date)}</td>
            <td><span className={`chip chip-${e.type}`}>{e.type==='expense'?LABELS.expense:LABELS.income}</span></td>
            <td>{e.description}</td>
            <td style={{color:'var(--muted)',fontSize:'.8rem'}}>{e.category}</td>
            <td style={{color:e.type==='expense'?'var(--red)':'var(--green)',fontWeight:700}}>₹{fmt(e.amount)}</td>
            <td style={{color:'var(--muted)',fontSize:'.8rem'}}>{e.notes||'-'}</td>
          </tr>)}
        </tbody></table> : <div className="empty">No entries for this user.</div>}
      </div>}

      {tab==='udhar' && <div className="card">
        {udhar.length ? <table><thead><tr><th>Date</th><th>Type</th><th>Person</th><th>Total</th><th>Paid</th><th>Remaining</th><th>Status</th></tr></thead><tbody>
          {udhar.map(u=><tr key={u.id}>
            <td>{fmtDate(u.date)}</td>
            <td><span className={`chip chip-${u.type}`}>{u.type==='gave'?LABELS.gave:LABELS.got}</span></td>
            <td style={{fontWeight:700}}>{u.person_name}</td>
            <td>₹{fmt(u.amount)}</td>
            <td style={{color:'var(--green)',fontWeight:700}}>₹{fmt(u.paid_amount||0)}</td>
            <td style={{color:'var(--red)',fontWeight:700}}>₹{fmt(u.amount-(u.paid_amount||0))}</td>
            <td>{u.status==='paid'?<span className="chip chip-paid">✅ Paid</span>:u.status==='partial'?<span className="chip" style={{background:'#f9731622',color:'var(--accent)'}}>⏳ Partial</span>:<span className="chip chip-pending">⏳ Pending</span>}</td>
          </tr>)}
        </tbody></table> : <div className="empty">No udhar entries.</div>}
      </div>}
    </div>
  )
}