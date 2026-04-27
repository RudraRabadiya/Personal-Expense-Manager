import { useEffect, useState } from 'react'
import api from '../lib/api'
import { fmt, fmtDate, LABELS } from '../lib/utils'
import AddUdharModal from '../components/AddUdharModal'
import PaymentModal from '../components/PaymentModal'
import toast from 'react-hot-toast'

export default function Udhar() {
  const [udhar, setUdhar] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [paymentTarget, setPaymentTarget] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const res = await api.get('/udhar/')
    setUdhar(res.data.sort((a,b)=>b.date.localeCompare(a.date)))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const deleteUdhar = async (id) => {
    if (!confirm('Delete this entry?')) return
    await api.delete(`/udhar/${id}`); toast.success('Deleted'); load()
  }

  const gave = udhar.filter(u=>u.type==='gave')
  const got = udhar.filter(u=>u.type==='got')
  const pendingGave = gave.filter(u=>u.status!=='paid').reduce((s,u)=>s+(u.amount-(u.paid_amount||0)),0)
  const pendingGot = got.filter(u=>u.status!=='paid').reduce((s,u)=>s+(u.amount-(u.paid_amount||0)),0)
  const displayed = udhar.filter(u => filter==='all' || u.type===filter)

  const statusChip = (u) => {
    if (u.status==='paid') return <span className="chip chip-paid">✅ Paid</span>
    if (u.status==='partial') return <span className="chip" style={{background:'#f9731622',color:'var(--accent)'}}>⏳ Partial</span>
    return <span className="chip chip-pending">⏳ Pending</span>
  }

  const progressBar = (u) => {
    const pct = Math.min(100, Math.round(((u.paid_amount||0) / u.amount) * 100))
    if (pct === 0) return null
    return (
      <div style={{marginTop:4}}>
        <div style={{background:'var(--border)',borderRadius:20,height:4,overflow:'hidden',width:100}}>
          <div style={{width:`${pct}%`,height:'100%',background:'var(--green)',borderRadius:20}}></div>
        </div>
        <div style={{fontSize:'.7rem',color:'var(--muted)',marginTop:2}}>{pct}% paid</div>
      </div>
    )
  }

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
        <div className="page-title" style={{margin:0}}>🤝 Udhar Book</div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}>+ Add Udhar</button>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">{LABELS.gave} (Baki)</div><div className="stat-value" style={{color:'var(--blue)'}}>₹{fmt(pendingGave)}</div><div className="stat-sub">Milva nu baki</div></div>
        <div className="stat-card"><div className="stat-label">{LABELS.got} (Baki)</div><div className="stat-value" style={{color:'var(--yellow)'}}>₹{fmt(pendingGot)}</div><div className="stat-sub">Aapva nu baki</div></div>
        <div className="stat-card"><div className="stat-label">Net</div><div className="stat-value" style={{color:pendingGave-pendingGot>=0?'var(--green)':'var(--red)'}}>₹{fmt(Math.abs(pendingGave-pendingGot))}</div><div className="stat-sub">{pendingGave>=pendingGot?'Tamara favour ma':'Tame vahu aapva na cho'}</div></div>
      </div>
      <div className="filter-bar">
        {[['all','All'], ['gave', LABELS.gave], ['got', LABELS.got]].map(([f,label])=>(
          <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-secondary'}`} onClick={()=>setFilter(f)}>{label}</button>
        ))}
      </div>
      <div className="card">
        {displayed.length ? <table><thead><tr><th>Date</th><th>Type</th><th>Person</th><th>Total</th><th>Paid</th><th>Remaining</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {displayed.map(u=>(
            <tr key={u.id}>
              <td>{fmtDate(u.date)}</td>
              <td><span className={`chip chip-${u.type}`}>{u.type==='gave'?LABELS.gave:LABELS.got}</span></td>
              <td><div style={{fontWeight:700}}>{u.person_name}</div><div style={{fontSize:'.78rem',color:'var(--muted)'}}>{u.description||''}</div></td>
              <td style={{fontWeight:700}}>₹{fmt(u.amount)}</td>
              <td style={{color:'var(--green)',fontWeight:700}}>₹{fmt(u.paid_amount||0)}</td>
              <td><div style={{color:'var(--red)',fontWeight:700}}>₹{fmt(u.amount-(u.paid_amount||0))}</div>{progressBar(u)}</td>
              <td>{statusChip(u)}</td>
              <td><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {u.status!=='paid'&&<button className="btn btn-sm" style={{background:'#3b82f622',border:'1px solid var(--blue)',color:'var(--blue)'}} onClick={()=>setPaymentTarget(u)}>💳 Pay</button>}
                <button className="btn btn-danger btn-sm" onClick={()=>deleteUdhar(u.id)}>Delete</button>
              </div></td>
            </tr>
          ))}
        </tbody></table> : <div className="empty">No udhar entries found.</div>}
      </div>
      {showModal && <AddUdharModal onClose={()=>setShowModal(false)} onSuccess={load} />}
      {paymentTarget && <PaymentModal udhar={paymentTarget} onClose={()=>setPaymentTarget(null)} onSuccess={load} />}
    </div>
  )
}