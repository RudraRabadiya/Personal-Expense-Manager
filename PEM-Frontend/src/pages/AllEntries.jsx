import { useEffect, useState } from 'react'
import api from '../lib/api'
import { fmt, fmtDate, LABELS } from '../lib/utils'
import AddEntryModal from '../components/AddEntryModal'
import AddUdharModal from '../components/AddUdharModal'
import { exportExcel } from '../lib/exportExcel'
import toast from 'react-hot-toast'

export default function AllEntries() {
  const [entries, setEntries]         = useState([])
  const [udhar, setUdhar]             = useState([])
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [showUdharModal, setShowUdharModal] = useState(false)
  const [editEntry, setEditEntry]     = useState(null)
  const [editUdhar, setEditUdhar]     = useState(null)
  const [filter, setFilter]           = useState('all')
  const [search, setSearch]           = useState('')
  const [loading, setLoading]         = useState(true)

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
  ].sort((a, b) => b.date.localeCompare(a.date))

  const filtered = allItems.filter(item => {
    const matchType = filter === 'all'
      || (filter === 'expense' && item._kind === 'entry' && item.type === 'expense')
      || (filter === 'income'  && item._kind === 'entry' && item.type === 'income')
      || (filter === 'gave'    && item._kind === 'udhar' && item.type === 'gave')
      || (filter === 'got'     && item._kind === 'udhar' && item.type === 'got')
    if (!matchType) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const desc = (item.description || item.person_name || '').toLowerCase()
    const cat  = (item.category || '').toLowerCase()
    return desc.includes(q) || cat.includes(q)
  })

  const typeChip = (item) => {
    if (item._kind === 'entry')
      return <span className={`chip chip-${item.type}`}>{item.type === 'expense' ? LABELS.expense : LABELS.income}</span>
    return <span className={`chip chip-${item.type}`}>{item.type === 'gave' ? LABELS.gave : LABELS.got}</span>
  }

  const amtCell = (item) => {
    if (item._kind === 'entry') {
      return (
        <td>
          <span className="amount" style={{ color: item.type === 'expense' ? 'var(--red)' : 'var(--green)', fontWeight: 500 }}>
            {item.type === 'expense' ? '−' : '+'}₹{fmt(item.amount)}
          </span>
        </td>
      )
    }
    const remaining = item.amount - (item.paid_amount || 0)
    return (
      <td>
        <div className="amount" style={{ color: item.type === 'gave' ? 'var(--blue)' : 'var(--yellow)', fontWeight: 500 }}>₹{fmt(item.amount)}</div>
        {item.paid_amount > 0 && <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>Baki: ₹{fmt(remaining)}</div>}
      </td>
    )
  }

  const statusCell = (item) => {
    if (item._kind === 'entry')
      return <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{item.notes || '—'}</td>
    const s = item.status
    return (
      <td>
        {s === 'paid'    ? <span className="chip chip-paid">✓ Paid</span>
        : s === 'partial' ? <span className="chip chip-partial">⏳ Partial</span>
        :                   <span className="chip chip-pending">⏳ Pending</span>}
      </td>
    )
  }

  const filters = [
    ['all', 'All'],
    ['expense', LABELS.expense],
    ['income',  LABELS.income],
    ['gave',    LABELS.gave],
    ['got',     LABELS.got],
  ]

  if (loading) return (
    <div className="loading-wrap"><div className="spinner" /> Loading…</div>
  )

  return (
    <div>
      <div className="page-header fade-up">
        <div>
          <div className="page-title">All Entries</div>
          <div className="page-subtitle">{filtered.length} of {allItems.length} records</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            id="export-excel-btn"
            className="btn btn-success btn-sm"
            onClick={() => {
              const filteredEntries = filtered.filter(i => i._kind === 'entry')
              const filteredUdhar  = filtered.filter(i => i._kind === 'udhar')
              exportExcel(filteredEntries, filteredUdhar, 'PEM_AllEntries')
              toast.success('Excel file downloaded!')
            }}
          >
            📥 Export Excel
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowUdharModal(true)}>+ Udhar</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowEntryModal(true)}>+ Entry</button>
        </div>
      </div>

      <div className="filter-bar fade-up fade-up-1">
        {filters.map(([f, label]) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {label}
          </button>
        ))}
        <input
          className="search-input"
          placeholder="🔍  Search entries…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 'auto' }}
        />
      </div>

      <div className="card fade-up fade-up-2">
        {filtered.length ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description / Person</th>
                <th>Amount</th>
                <th>Status / Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id + item._kind}>
                  <td style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {fmtDate(item.date)}
                  </td>
                  <td>{typeChip(item)}</td>
                  <td>
                    {item._kind === 'entry' ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.description}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>{item.category}</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.person_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>{item.description || ''}</div>
                      </div>
                    )}
                  </td>
                  {amtCell(item)}
                  {statusCell(item)}
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        title="Edit"
                        onClick={() => item._kind === 'entry' ? setEditEntry(item) : setEditUdhar(item)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        title="Delete"
                        onClick={() => item._kind === 'entry' ? deleteEntry(item.id) : deleteUdhar(item.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            No entries found.
          </div>
        )}
      </div>

      {showEntryModal && <AddEntryModal onClose={() => setShowEntryModal(false)} onSuccess={load} />}
      {showUdharModal && <AddUdharModal onClose={() => setShowUdharModal(false)} onSuccess={load} />}
      {editEntry      && <AddEntryModal entry={editEntry}  onClose={() => setEditEntry(null)}  onSuccess={load} />}
      {editUdhar      && <AddUdharModal udhar={editUdhar}  onClose={() => setEditUdhar(null)}  onSuccess={load} />}
    </div>
  )
}