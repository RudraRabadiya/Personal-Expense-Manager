import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { fmt, fmtDate, LABELS } from '../lib/utils'
import AddEntryModal from '../components/AddEntryModal'

export default function Dashboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [udhar, setUdhar] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [e, u] = await Promise.all([api.get('/entries/'), api.get('/udhar/')])
    setEntries(e.data); setUdhar(u.data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const income = entries.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0)
  const expense = entries.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0)
  const udharGaveRemaining = udhar.filter(u=>u.type==='gave'&&u.status!=='paid').reduce((s,u)=>s+(u.amount-(u.paid_amount||0)),0)
  const udharGotRemaining = udhar.filter(u=>u.type==='got'&&u.status!=='paid').reduce((s,u)=>s+(u.amount-(u.paid_amount||0)),0)
  const balance = income - expense + udharGaveRemaining - udharGotRemaining
  const recent = [...entries].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8)

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
        <div className="page-title" style={{margin:0}}>👋 Welcome, {user?.name?.split(' ')[0]}!</div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}>+ Add Entry</button>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total {LABELS.income}</div><div className="stat-value" style={{color:'var(--green)'}}>₹{fmt(income)}</div><div className="stat-sub">{entries.filter(e=>e.type==='income').length} entries</div></div>
        <div className="stat-card"><div className="stat-label">Total {LABELS.expense}</div><div className="stat-value" style={{color:'var(--red)'}}>₹{fmt(expense)}</div><div className="stat-sub">{entries.filter(e=>e.type==='expense').length} entries</div></div>
        <div className="stat-card">
          <div className="stat-label">Net Balance</div>
          <div className="stat-value" style={{color:balance>=0?'var(--green)':'var(--red)'}}>₹{fmt(Math.abs(balance))}</div>
          <div className="stat-sub" style={{fontSize:'.7rem'}}>{LABELS.income} − {LABELS.expense} {udharGaveRemaining>0?`+ ₹${fmt(udharGaveRemaining)} milva nu`:''}{udharGotRemaining>0?` − ₹${fmt(udharGotRemaining)} aapva nu`:''}</div>
        </div>
        <div className="stat-card"><div className="stat-label">{LABELS.gave}</div><div className="stat-value" style={{color:'var(--blue)'}}>₹{fmt(udharGaveRemaining)}</div><div className="stat-sub">Milva nu baki</div></div>
        <div className="stat-card"><div className="stat-label">{LABELS.got}</div><div className="stat-value" style={{color:'var(--yellow)'}}>₹{fmt(udharGotRemaining)}</div><div className="stat-sub">Aapva nu baki</div></div>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Recent Entries</div></div>
        {recent.length ? <table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead><tbody>
          {recent.map(e=><tr key={e.id}>
            <td>{fmtDate(e.date)}</td>
            <td><span className={`chip chip-${e.type}`}>{e.type==='expense'?LABELS.expense:LABELS.income}</span></td>
            <td>{e.description}</td>
            <td style={{color:'var(--muted)',fontSize:'.8rem'}}>{e.category}</td>
            <td style={{color:e.type==='expense'?'var(--red)':'var(--green)',fontWeight:700}}>₹{fmt(e.amount)}</td>
          </tr>)}
        </tbody></table> : <div className="empty">No entries yet. Add your first entry!</div>}
      </div>
      {showModal && <AddEntryModal onClose={()=>setShowModal(false)} onSuccess={load} />}
    </div>
  )
}