import { useEffect, useState } from 'react'
import api from '../lib/api'
import { fmt, fmtDate, LABELS } from '../lib/utils'
import AddUdharModal from '../components/AddUdharModal'
import PaymentModal from '../components/PaymentModal'
import toast from 'react-hot-toast'

// ── Due date helpers ─────────────────────────────────────────────────────────
function getDueDays(due_date) {
  if (!due_date) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due   = new Date(due_date); due.setHours(0, 0, 0, 0)
  return Math.round((due - today) / (1000 * 60 * 60 * 24))
}

function DueBadge({ due_date, status }) {
  if (!due_date || status === 'paid') return null
  const days = getDueDays(due_date)
  if (days < 0)
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f43f5e18', color: 'var(--red)', border: '1px solid #f43f5e30', borderRadius: 100, padding: '2px 9px', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>🔴 {Math.abs(days)}d overdue</span>
  if (days === 0)
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f59e0b18', color: 'var(--yellow)', border: '1px solid #f59e0b30', borderRadius: 100, padding: '2px 9px', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>⚠️ Due today</span>
  if (days <= 7)
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f59e0b12', color: 'var(--yellow)', border: '1px solid #f59e0b28', borderRadius: 100, padding: '2px 9px', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>📅 {days}d left</span>
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 100, padding: '2px 9px', fontSize: '0.68rem', fontWeight: 600, whiteSpace: 'nowrap' }}>📅 {fmtDate(due_date)}</span>
}

export default function Udhar() {
  const [udhar, setUdhar]                 = useState([])
  const [showModal, setShowModal]         = useState(false)
  const [editUdhar, setEditUdhar]         = useState(null)
  const [paymentTarget, setPaymentTarget] = useState(null)
  const [filter, setFilter]               = useState('all')
  const [loading, setLoading]             = useState(true)

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
  const pendingGot  = got.filter(u  => u.status !== 'paid').reduce((s, u) => s + (u.amount - (u.paid_amount || 0)), 0)
  const displayed   = udhar.filter(u => filter === 'all' || u.type === filter)

  // Overdue count for banner
  const overdueCount = udhar.filter(u => u.status !== 'paid' && u.due_date && getDueDays(u.due_date) < 0).length
  const dueTodayCount = udhar.filter(u => u.status !== 'paid' && u.due_date && getDueDays(u.due_date) === 0).length

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
      {/* ── Overdue Alert Banner ── */}
      {(overdueCount > 0 || dueTodayCount > 0) && (
        <div style={{
          background: overdueCount > 0 ? 'linear-gradient(135deg, #f43f5e18, #f43f5e08)' : 'linear-gradient(135deg, #f59e0b18, #f59e0b08)',
          border: `1px solid ${overdueCount > 0 ? '#f43f5e40' : '#f59e0b40'}`,
          borderRadius: 'var(--radius-md)', padding: '14px 20px',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fadeUp 0.4s ease',
        }}>
          <span style={{ fontSize: '1.4rem' }}>{overdueCount > 0 ? '🚨' : '⚠️'}</span>
          <div>
            <div style={{ fontWeight: 700, color: overdueCount > 0 ? 'var(--red)' : 'var(--yellow)', fontSize: '0.9rem' }}>
              {overdueCount > 0 ? `${overdueCount} udhar ${overdueCount === 1 ? 'entry is' : 'entries are'} overdue!` : ''}
              {dueTodayCount > 0 ? ` ${dueTodayCount} ${dueTodayCount === 1 ? 'entry' : 'entries'} due today.` : ''}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
              Review the table below and follow up with the person.
            </div>
          </div>
        </div>
      )}

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
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(u => {
                const days = getDueDays(u.due_date)
                const isOverdue = u.status !== 'paid' && u.due_date && days < 0
                return (
                  <tr key={u.id} style={{ background: isOverdue ? '#f43f5e06' : undefined }}>
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
                    <td>
                      <DueBadge due_date={u.due_date} status={u.status} />
                      {!u.due_date && <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>—</span>}
                    </td>
                    <td>{statusChip(u)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {u.status !== 'paid' && (
                          <button className="btn btn-blue btn-sm" onClick={() => setPaymentTarget(u)}>
                            💳 Pay
                          </button>
                        )}
                        <button className="btn btn-secondary btn-icon" title="Edit" onClick={() => setEditUdhar(u)}>✏️</button>
                        <button className="btn btn-danger btn-icon" title="Delete" onClick={() => deleteUdhar(u.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            <div className="empty-icon">🤝</div>
            No udhar entries found.
          </div>
        )}
      </div>

      {showModal      && <AddUdharModal onClose={() => setShowModal(false)} onSuccess={load} />}
      {editUdhar      && <AddUdharModal udhar={editUdhar} onClose={() => setEditUdhar(null)} onSuccess={load} />}
      {paymentTarget  && <PaymentModal udhar={paymentTarget} onClose={() => setPaymentTarget(null)} onSuccess={load} />}
    </div>
  )
}