import { useEffect, useState } from 'react'
import api from '../lib/api'
import { fmt, fmtDate, LABELS } from '../lib/utils'
import AddUdharModal from '../components/AddUdharModal'
import PaymentModal from '../components/PaymentModal'
import toast from 'react-hot-toast'

export default function Udhar() {
  const [udhar, setUdhar]             = useState([])
  const [showModal, setShowModal]     = useState(false)
  const [paymentTarget, setPaymentTarget] = useState(null)
  const [filter, setFilter]           = useState('all')
  const [loading, setLoading]         = useState(true)

  const load = async () => {
    const res = await api.get('/udhar/')
    setUdhar(res.data.sort((a, b) => b.date.localeCompare(a.date)))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const deleteUdhar = async (id) => {
    if (!confirm('Delete this entry?')) return
    await api.delete(`/udhar/${id}`); toast.success('Deleted'); load()
  }

  const gave        = udhar.filter(u => u.type === 'gave')
  const got         = udhar.filter(u => u.type === 'got')
  const pendingGave = gave.filter(u => u.status !== 'paid').reduce((s, u) => s + (u.amount - (u.paid_amount || 0)), 0)
  const pendingGot  = got.filter(u => u.status !== 'paid').reduce((s, u) => s + (u.amount - (u.paid_amount || 0)), 0)
  const displayed   = udhar.filter(u => filter === 'all' || u.type === filter)

  const statusChip = (u) => {
    if (u.status === 'paid')    return <span className="chip chip-paid">✓ Paid</span>
    if (u.status === 'partial') return <span className="chip chip-partial">⏳ Partial</span>
    return <span className="chip chip-pending">⏳ Pending</span>
  }

  const progressBar = (u) => {
    const pct = Math.min(100, Math.round(((u.paid_amount || 0) / u.amount) * 100))
    if (pct === 0) return null
    return (
      <div style={{ marginTop: 6 }}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-label">{pct}% paid</div>
      </div>
    )
  }

  if (loading) return (
    <div className="loading-wrap"><div className="spinner" /> Loading…</div>
  )

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header fade-up">
        <div>
          <div className="page-title">Udhar Book</div>
          <div className="page-subtitle">Track money lent and borrowed</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Udhar</button>
      </div>

      {/* ── Stats ── */}
      <div className="stat-grid fade-up fade-up-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card blue">
          <div className="stat-label">{LABELS.gave} (Baki)</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>₹{fmt(pendingGave)}</div>
          <div className="stat-sub">Milva nu baki</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">{LABELS.got} (Baki)</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>₹{fmt(pendingGot)}</div>
          <div className="stat-sub">Aapva nu baki</div>
        </div>
        <div className={`stat-card ${pendingGave - pendingGot >= 0 ? 'green' : 'red'}`}>
          <div className="stat-label">Net</div>
          <div className="stat-value" style={{ color: pendingGave - pendingGot >= 0 ? 'var(--green)' : 'var(--red)' }}>
            ₹{fmt(Math.abs(pendingGave - pendingGot))}
          </div>
          <div className="stat-sub">{pendingGave >= pendingGot ? 'Tamara favour ma' : 'Tame vahu aapva na cho'}</div>
        </div>
      </div>

      {/* ── Filter ── */}
      <div className="filter-bar fade-up fade-up-2">
        {[['all', 'All'], ['gave', LABELS.gave], ['got', LABELS.got]].map(([f, label]) => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="card fade-up fade-up-3">
        {displayed.length ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Person</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Paid</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {fmtDate(u.date)}
                  </td>
                  <td><span className={`chip chip-${u.type}`}>{u.type === 'gave' ? LABELS.gave : LABELS.got}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.person_name}</div>
                    {u.description && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>{u.description}</div>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount" style={{ fontWeight: 500 }}>₹{fmt(u.amount)}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount" style={{ color: 'var(--green)', fontWeight: 500 }}>₹{fmt(u.paid_amount || 0)}</span>
                  </td>
                  <td>
                    <span className="amount" style={{ color: 'var(--red)', fontWeight: 500 }}>₹{fmt(u.amount - (u.paid_amount || 0))}</span>
                    {progressBar(u)}
                  </td>
                  <td>{statusChip(u)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {u.status !== 'paid' && (
                        <button className="btn btn-blue btn-sm" onClick={() => setPaymentTarget(u)}>
                          💳 Pay
                        </button>
                      )}
                      <button className="btn btn-danger btn-icon" title="Delete" onClick={() => deleteUdhar(u.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            <div className="empty-icon">🤝</div>
            No udhar entries found.
          </div>
        )}
      </div>

      {showModal       && <AddUdharModal onClose={() => setShowModal(false)} onSuccess={load} />}
      {paymentTarget   && <PaymentModal udhar={paymentTarget} onClose={() => setPaymentTarget(null)} onSuccess={load} />}
    </div>
  )
}