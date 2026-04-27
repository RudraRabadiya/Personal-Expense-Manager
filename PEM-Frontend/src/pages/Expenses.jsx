import { useEffect, useState } from 'react'
import api from '../lib/api'
import { fmt, fmtDate, LABELS } from '../lib/utils'
import AddEntryModal from '../components/AddEntryModal'
import toast from 'react-hot-toast'

export default function Expenses() {
  const [entries, setEntries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const res = await api.get('/entries/')
    setEntries(res.data.filter(e=>e.type==='expense').sort((a,b)=>b.date.localeCompare(a.date)))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const deleteEntry = async (id) => {
    if (!confirm('Delete this entry?')) return
    await api.delete(`/entries/${id}`); toast.success('Deleted'); load()
  }

  const total = entries.reduce((s,e)=>s+e.amount,0)
  if (loading) return <div className="empty">Loading...</div>

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
        <div className="page-title" style={{margin:0}}>{LABELS.expense}</div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}>+ Add {LABELS.expense}</button>
      </div>
      <div className="stat-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="stat-card"><div className="stat-label">Total {LABELS.expense}</div><div className="stat-value" style={{color:'var(--red)'}}>₹{fmt(total)}</div></div>
        <div className="stat-card"><div className="stat-label">This Month</div><div className="stat-value" style={{color:'var(--red)'}}>₹{fmt(entries.filter(e=>e.date.startsWith(new Date().toISOString().slice(0,7))).reduce((s,e)=>s+e.amount,0))}</div></div>
        <div className="stat-card"><div className="stat-label">Total Entries</div><div className="stat-value">{entries.length}</div></div>
      </div>
      <div className="card">
        {entries.length ? <table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Notes</th><th></th></tr></thead><tbody>
          {entries.map(e=><tr key={e.id}>
            <td>{fmtDate(e.date)}</td><td>{e.description}</td>
            <td style={{color:'var(--muted)',fontSize:'.8rem'}}>{e.category}</td>
            <td style={{color:'var(--red)',fontWeight:700}}>₹{fmt(e.amount)}</td>
            <td style={{color:'var(--muted)',fontSize:'.8rem'}}>{e.notes||'-'}</td>
            <td><button className="btn btn-danger btn-sm" onClick={()=>deleteEntry(e.id)}>Delete</button></td>
          </tr>)}
        </tbody></table> : <div className="empty">No {LABELS.expense} entries yet.</div>}
      </div>
      {showModal && <AddEntryModal type="expense" onClose={()=>setShowModal(false)} onSuccess={load} />}
    </div>
  )
}