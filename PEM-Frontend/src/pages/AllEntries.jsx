import { useEffect, useState } from 'react'
import api from '../lib/api'
import { fmt, fmtDate, LABELS } from '../lib/utils'
import AddEntryModal from '../components/AddEntryModal'
import AddUdharModal from '../components/AddUdharModal'
import toast from 'react-hot-toast'

export default function AllEntries() {
  const [entries, setEntries] = useState([])
  const [udhar, setUdhar] = useState([])
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [showUdharModal, setShowUdharModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [e, u] = await Promise.all([api.get('/entries/'), api.get('/udhar/')])
    setEntries(e.data); setUdhar(u.data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const deleteEntry = async (id) => {
    if (!confirm('Delete?')) return
    await api.delete(`/entries/${id}`); toast.success('Deleted'); load()
  }
  const deleteUdhar = async (id) => {
    if (!confirm('Delete?')) return
    await api.delete(`/udhar/${id}`); toast.success('Deleted'); load()
  }

  const allItems = [
    ...entries.map(e => ({ ...e, _kind: 'entry' })),
    ...udhar.map(u => ({ ...u, _kind: 'udhar' }))
  ].sort((a,b) => b.date.localeCompare(a.date))

  const filtered = allItems.filter(item => {
    if (filter === 'all') return true
    if (filter === 'expense') return item._kind==='entry' && item.type==='expense'
    if (filter === 'income') return item._kind==='entry' && item.type==='income'
    if (filter === 'gave') return item._kind==='udhar' && item.type==='gave'
    if (filter === 'got') return item._kind==='udhar' && item.type==='got'
    return true
  })

  const typeChip = (item) => {
    if (item._kind === 'entry')
      return <span className={`chip chip-${item.type}`}>{item.type==='expense'?LABELS.expense:LABELS.income}</span>
    return <span className={`chip chip-${item.type}`}>{item.type==='gave'?LABELS.gave:LABELS.got}</span>
  }

  const amtCell = (item) => {
    if (item._kind === 'entry')
      return <td style={{color:item.type==='expense'?'var(--red)':'var(--green)',fontWeight:700}}>₹{fmt(item.amount)}</td>
    const remaining = item.amount - (item.paid_amount||0)
    return <td>
      <div style={{color:item.type==='gave'?'var(--blue)':'var(--yellow)',fontWeight:700}}>₹{fmt(item.amount)}</div>
      {item.paid_amount>0&&<div style={{fontSize:'.75rem',color:'var(--muted)'}}>Baki: ₹{fmt(remaining)}</div>}
    </td>
  }

  const statusCell = (item) => {
    if (item._kind === 'entry') return <td style={{color:'var(--muted)',fontSize:'.8rem'}}>{item.notes||'-'}</td>
    const s = item.status
    return <td>{s==='paid'?<span className="chip chip-paid">✅ Paid</span>:s==='partial'?<span className="chip" style={{background:'#f9731622',color:'var(--accent)'}}>⏳ Partial</span>:<span className="chip chip-pending">⏳ Pending</span>}</td>
  }

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
        <div className="page-title" style={{margin:0}}>📋 All Entries</div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>setShowUdharModal(true)}>+ Udhar</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowEntryModal(true)}>+ Entry</button>
        </div>
      </div>
      <div className="filter-bar">
        {[['all','All'],['expense',LABELS.expense],['income',LABELS.income],['gave',LABELS.gave],['got',LABELS.got]].map(([f,label])=>(
          <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-secondary'}`} onClick={()=>setFilter(f)}>{label}</button>
        ))}
      </div>
      <div style={{color:'var(--muted)',fontSize:'.82rem',marginBottom:12}}>{filtered.length} entries</div>
      <div className="card">
        {filtered.length ? <table><thead><tr><th>Date</th><th>Type</th><th>Description / Person</th><th>Amount</th><th>Status / Notes</th><th></th></tr></thead><tbody>
          {filtered.map(item=>(
            <tr key={item.id}>
              <td>{fmtDate(item.date)}</td>
              <td>{typeChip(item)}</td>
              <td>{item._kind==='entry'?<div><div>{item.description}</div><div style={{fontSize:'.78rem',color:'var(--muted)'}}>{item.category}</div></div>:<div><div style={{fontWeight:700}}>{item.person_name}</div><div style={{fontSize:'.78rem',color:'var(--muted)'}}>{item.description||''}</div></div>}</td>
              {amtCell(item)}
              {statusCell(item)}
              <td><button className="btn btn-danger btn-sm" onClick={()=>item._kind==='entry'?deleteEntry(item.id):deleteUdhar(item.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody></table> : <div className="empty">No entries found.</div>}
      </div>
      {showEntryModal && <AddEntryModal onClose={()=>setShowEntryModal(false)} onSuccess={load} />}
      {showUdharModal && <AddUdharModal onClose={()=>setShowUdharModal(false)} onSuccess={load} />}
    </div>
  )
}