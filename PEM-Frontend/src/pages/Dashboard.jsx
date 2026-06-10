import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { fmt, fmtDate, LABELS } from '../lib/utils'
import AddEntryModal from '../components/AddEntryModal'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function getDueDays(due_date) {
  if (!due_date) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due   = new Date(due_date); due.setHours(0, 0, 0, 0)
  return Math.round((due - today) / (1000 * 60 * 60 * 24))
}

function buildChartData(entries) {
  const months = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('en-IN', { month: 'short' })
    months[key] = { month: label, income: 0, expense: 0 }
  }
  entries.forEach(e => {
    const key = e.date.slice(0, 7)
    if (months[key]) {
      if (e.type === 'income')  months[key].income  += e.amount
      if (e.type === 'expense') months[key].expense += e.amount
    }
  })
  return Object.values(months)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 10, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
      <div style={{ color: 'var(--muted)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.dataKey === 'income' ? '↑ Income' : '↓ Expense'}: ₹{Number(p.value).toLocaleString('en-IN')}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [udhar, setUdhar]     = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [e, u] = await Promise.all([api.get('/entries/'), api.get('/udhar/')])
    setEntries(e.data); setUdhar(u.data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const income  = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const expense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const udharGaveRemaining = udhar.filter(u => u.type === 'gave' && u.status !== 'paid').reduce((s, u) => s + (u.amount - (u.paid_amount || 0)), 0)
  const udharGotRemaining  = udhar.filter(u => u.type === 'got'  && u.status !== 'paid').reduce((s, u) => s + (u.amount - (u.paid_amount || 0)), 0)
  const balance = income - expense + udharGaveRemaining - udharGotRemaining
  const recent  = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)
  const chartData = buildChartData(entries)

  if (loading) return (
    <div className="loading-wrap">
      <div className="spinner" />
      Loading…
    </div>
  )

  const overdueUdhar  = udhar.filter(u => u.status !== 'paid' && u.due_date && getDueDays(u.due_date) < 0)
  const dueTodayUdhar = udhar.filter(u => u.status !== 'paid' && u.due_date && getDueDays(u.due_date) === 0)
  const urgentCount   = overdueUdhar.length + dueTodayUdhar.length

  return (
    <div>
      {urgentCount > 0 && (
        <div style={{
          background: overdueUdhar.length > 0 ? 'linear-gradient(135deg,#f43f5e18,#f43f5e06)' : 'linear-gradient(135deg,#f59e0b18,#f59e0b06)',
          border: `1px solid ${overdueUdhar.length > 0 ? '#f43f5e40' : '#f59e0b40'}`,
          borderRadius: 'var(--radius-md)', padding: '14px 20px',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fadeUp 0.4s ease',
        }}>
          <span style={{ fontSize: '1.4rem' }}>{overdueUdhar.length > 0 ? '🚨' : '⚠️'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: overdueUdhar.length > 0 ? 'var(--red)' : 'var(--yellow)', fontSize: '0.9rem' }}>
              {overdueUdhar.length > 0 && `${overdueUdhar.length} udhar ${overdueUdhar.length === 1 ? 'entry' : 'entries'} overdue! `}
              {dueTodayUdhar.length > 0 && `${dueTodayUdhar.length} ${dueTodayUdhar.length === 1 ? 'entry' : 'entries'} due today.`}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
              {[...overdueUdhar, ...dueTodayUdhar].map(u => u.person_name).join(', ')}
            </div>
          </div>
          <a href="/udhar" style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', textDecoration: 'none' }}>View Udhar →</a>
        </div>
      )}

      <div className="greeting fade-up">
        <div className="greeting-text">
          {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </div>
        <div className="greeting-sub">
          Here's your financial overview for today · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-grid fade-up fade-up-1">
        <div className="stat-card green">
          <div className="stat-label">Total {LABELS.income}</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>₹{fmt(income)}</div>
          <div className="stat-sub">{entries.filter(e => e.type === 'income').length} entries</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Total {LABELS.expense}</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>₹{fmt(expense)}</div>
          <div className="stat-sub">{entries.filter(e => e.type === 'expense').length} entries</div>
        </div>
        <div className={`stat-card ${balance >= 0 ? 'green' : 'red'} accent`}>
          <div className="stat-label">Net Balance</div>
          <div className="stat-value" style={{ color: balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {balance < 0 ? '−' : ''}₹{fmt(Math.abs(balance))}
          </div>
          <div className="stat-sub">Income − Expense ± Udhar</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">{LABELS.gave}</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>₹{fmt(udharGaveRemaining)}</div>
          <div className="stat-sub">Milva nu baki</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">{LABELS.got}</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>₹{fmt(udharGotRemaining)}</div>
          <div className="stat-sub">Aapva nu baki</div>
        </div>
      </div>

      {/* ── Chart + Recent ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>

        {/* Bar Chart */}
        <div className="card fade-up fade-up-2">
          <div className="card-header">
            <div className="card-title">Income vs Expense — Last 6 Months</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Entry</button>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={56} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff06' }} />
                <Bar dataKey="income"  fill="#22c55e" radius={[5, 5, 0, 0]} maxBarSize={36} />
                <Bar dataKey="expense" fill="#ef4444" radius={[5, 5, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', paddingBottom: 12, fontSize: '0.75rem', color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--green)', display: 'inline-block' }} /> Income</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--red)', display: 'inline-block' }} /> Expense</span>
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="card fade-up fade-up-3">
          <div className="card-header">
            <div className="card-title">Recent Entries</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{recent.length} shown</span>
          </div>
          {recent.length ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(e => (
                  <tr key={e.id}>
                    <td style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{fmtDate(e.date)}</td>
                    <td><span className={`chip chip-${e.type}`}>{e.type === 'expense' ? LABELS.expense : LABELS.income}</span></td>
                    <td style={{ fontWeight: 500 }}>{e.description}</td>
                    <td><span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{e.category}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="amount" style={{ color: e.type === 'expense' ? 'var(--red)' : 'var(--green)', fontWeight: 500 }}>
                        {e.type === 'expense' ? '−' : '+'}₹{fmt(e.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">
              <div className="empty-icon">📊</div>
              No entries yet. Add your first entry!
            </div>
          )}
        </div>
      </div>

      {showModal && <AddEntryModal onClose={() => setShowModal(false)} onSuccess={load} />}
    </div>
  )
}