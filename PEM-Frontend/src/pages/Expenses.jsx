import { useEffect, useState } from 'react'
import api from '../lib/api'
import { fmt, fmtDate, LABELS } from '../lib/utils'
import AddEntryModal from '../components/AddEntryModal'
import toast from 'react-hot-toast'

export default function Expenses() {
  const [entries, setEntries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const res = await api.get('/entries/')
    setEntries(res.data.filter(e => e.type === 'expense').sort((a, b) => b.date.localeCompare(a.date)))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const deleteEntry = async (id) => {
    if (!confirm('Delete this entry?')) return
    await api.delete(`/entries/${id}`); toast.success('Deleted'); load()
  }

  const total     = entries.reduce((s, e) => s + e.amount, 0)
  const thisMonth = entries
    .filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, e) => s + e.amount, 0)

  if (loading) return (
    <div className="loading-wrap"><div className="spinner" /> Loading…</div>
  )

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header fade-up">
        <div>
          <div className="page-title">{LABELS.expense}</div>
          <div className="page-subtitle">All expense transactions</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + Add {LABELS.expense}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stat-grid fade-up fade-up-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card red">
          <div className="stat-label">Total {LABELS.expense}</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>₹{fmt(total)}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">This Month</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>₹{fmt(thisMonth)}</div>
          <div className="stat-sub">{new Date().toLocaleString('en-IN', { month: 'long' })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Entries</div>
          <div className="stat-value">{entries.length}</div>
          <div className="stat-sub">Recorded transactions</div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card fade-up fade-up-2">
        {entries.length ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{fmtDate(e.date)}</td>
                  <td style={{ fontWeight: 500 }}>{e.description}</td>
                  <td>
                    <span style={{ background: 'var(--surface2)', borderRadius: 6, padding: '2px 8px', fontSize: '0.74rem', color: 'var(--muted)' }}>
                      {e.category}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount" style={{ color: 'var(--red)', fontWeight: 500 }}>−₹{fmt(e.amount)}</span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{e.notes || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-icon" title="Edit" onClick={() => setEditEntry(e)}>✏️</button>
                      <button className="btn btn-danger btn-icon" title="Delete" onClick={() => deleteEntry(e.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            <div className="empty-icon">💸</div>
            No {LABELS.expense} entries yet.
          </div>
        )}
      </div>

      {showModal  && <AddEntryModal type="expense" onClose={() => setShowModal(false)} onSuccess={load} />}
      {editEntry  && <AddEntryModal entry={editEntry} onClose={() => setEditEntry(null)} onSuccess={load} />}
    </div>
  )
}