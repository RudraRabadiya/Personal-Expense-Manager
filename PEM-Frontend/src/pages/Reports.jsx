import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import { fmt, fmtDate, LABELS } from '../lib/utils'
import { exportExcel } from '../lib/exportExcel'
import toast from 'react-hot-toast'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Reports() {
  const currentYear  = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [view, setView]   = useState('monthly')
  const [year, setYear]   = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = view === 'monthly'
        ? `/reports/monthly?year=${year}&month=${month}`
        : `/reports/yearly?year=${year}`
      const res = await api.get(url)
      setData(res.data)
    } catch (e) { toast.error('Failed to load report') }
    finally { setLoading(false) }
  }, [view, year, month])

  useEffect(() => { load() }, [load])

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div>
      <div className="page-header fade-up">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-subtitle">Financial summaries and breakdowns</div>
        </div>
        {data && (
          <button
            id="reports-export-excel-btn"
            className="btn btn-success btn-sm"
            onClick={() => {
              const entries = data.entries || []
              const udhar   = data.udhar_this_month || []
              const label   = view === 'monthly'
                ? `PEM_${data.month_name}_${data.year}`
                : `PEM_Year_${data.year}`
              exportExcel(entries, udhar, label)
              toast.success('Excel file downloaded!')
            }}
          >
            📥 Export Excel
          </button>
        )}
      </div>

      <div className="filter-bar fade-up fade-up-1" style={{ marginBottom: 28 }}>
        <div className="tab-group">
          {[['monthly', '📅 Monthly'], ['yearly', '📊 Yearly']].map(([v, label]) => (
            <button key={v} className={`tab-btn ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
              {label}
            </button>
          ))}
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="search-input"
          style={{ minWidth: 'auto', width: 100 }}
        >
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
        {view === 'monthly' && (
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="search-input"
            style={{ minWidth: 'auto', width: 140 }}
          >
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        )}
      </div>

      {loading && <div className="loading-wrap"><div className="spinner" /> Loading…</div>}
      {!loading && data && view === 'monthly' && <MonthlyView data={data} />}
      {!loading && data && view === 'yearly'  && <YearlyView  data={data} />}
    </div>
  )
}

function MonthlyView({ data }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--muted)', letterSpacing: '-0.02em' }}>
        {data.month_name} {data.year}
      </div>

      <div className="stat-grid fade-up" style={{ marginBottom: 24 }}>
        <div className={`stat-card ${data.opening_balance >= 0 ? 'green' : 'red'}`}>
          <div className="stat-label">Opening Balance</div>
          <div className="stat-value" style={{ color: data.opening_balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
            ₹{fmt(Math.abs(data.opening_balance))}
          </div>
          <div className="stat-sub">Carried from last month</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">+ {LABELS.income}</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>₹{fmt(data.aavak)}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">− {LABELS.expense}</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>₹{fmt(data.javak)}</div>
        </div>
        <div className={`stat-card accent ${data.closing_balance >= 0 ? 'green' : 'red'}`}>
          <div className="stat-label">Closing Balance</div>
          <div className="stat-value" style={{ color: data.closing_balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
            ₹{fmt(Math.abs(data.closing_balance))}
          </div>
          <div className="stat-sub">Carries to next month</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div className="stat-card blue fade-up fade-up-1">
          <div className="stat-label">{LABELS.gave} Pending</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>₹{fmt(data.udhar_gave_pending)}</div>
          <div className="stat-sub">Milva nu baki</div>
        </div>
        <div className="stat-card yellow fade-up fade-up-1">
          <div className="stat-label">{LABELS.got} Pending</div>
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>₹{fmt(data.udhar_got_pending)}</div>
          <div className="stat-sub">Aapva nu baki</div>
        </div>
      </div>

      <div className="card fade-up fade-up-2" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="card-title">Entries this month ({data.entries.length})</div>
        </div>
        {data.entries.length ? (
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Type</th><th>Description</th><th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map(e => (
                <tr key={e.id}>
                  <td style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{fmtDate(e.date)}</td>
                  <td><span className={`chip chip-${e.type}`}>{e.type === 'income' ? LABELS.income : LABELS.expense}</span></td>
                  <td style={{ fontWeight: 500 }}>{e.description}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{e.category}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount" style={{ color: e.type === 'expense' ? 'var(--red)' : 'var(--green)', fontWeight: 500 }}>
                      {e.type === 'expense' ? '−' : '+'}₹{fmt(e.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty"><div className="empty-icon">📭</div>No entries this month</div>}
      </div>

      <div className="card fade-up fade-up-3">
        <div className="card-header">
          <div className="card-title">Udhar this month ({data.udhar_this_month.length})</div>
        </div>
        {data.udhar_this_month.length ? (
          <table>
            <thead>
              <tr><th>Date</th><th>Type</th><th>Person</th><th>Total</th><th>Paid</th><th>Remaining</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.udhar_this_month.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{fmtDate(u.date)}</td>
                  <td><span className={`chip chip-${u.type}`}>{u.type === 'gave' ? LABELS.gave : LABELS.got}</span></td>
                  <td style={{ fontWeight: 600 }}>{u.person_name}</td>
                  <td><span className="amount">₹{fmt(u.amount)}</span></td>
                  <td><span className="amount" style={{ color: 'var(--green)' }}>₹{fmt(u.paid_amount || 0)}</span></td>
                  <td><span className="amount" style={{ color: 'var(--red)' }}>₹{fmt(u.amount - (u.paid_amount || 0))}</span></td>
                  <td><span className={`chip chip-${u.status}`}>{u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty"><div className="empty-icon">🤝</div>No udhar entries this month</div>}
      </div>
    </div>
  )
}

function YearlyView({ data }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--muted)', letterSpacing: '-0.02em' }}>
        Year {data.year} Summary
      </div>

      <div className="stat-grid fade-up" style={{ marginBottom: 24 }}>
        <div className={`stat-card ${data.opening_balance >= 0 ? 'green' : 'red'}`}>
          <div className="stat-label">Opening Balance</div>
          <div className="stat-value" style={{ color: data.opening_balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
            ₹{fmt(Math.abs(data.opening_balance))}
          </div>
          <div className="stat-sub">Start of {data.year}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Total {LABELS.income}</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>₹{fmt(data.total_aavak)}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Total {LABELS.expense}</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>₹{fmt(data.total_javak)}</div>
        </div>
        <div className={`stat-card accent ${data.closing_balance >= 0 ? 'green' : 'red'}`}>
          <div className="stat-label">Closing Balance</div>
          <div className="stat-value" style={{ color: data.closing_balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
            ₹{fmt(Math.abs(data.closing_balance))}
          </div>
          <div className="stat-sub">End of {data.year}</div>
        </div>
      </div>

      <div className="card fade-up fade-up-1">
        <div className="card-header">
          <div className="card-title">Month by Month</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Opening</th>
              <th>{LABELS.income}</th>
              <th>{LABELS.expense}</th>
              <th>Closing</th>
              <th>Udhar Gave</th>
              <th>Udhar Got</th>
            </tr>
          </thead>
          <tbody>
            {(data.months || []).map(m => (
              <tr key={m.month} style={{ opacity: m.aavak === 0 && m.javak === 0 ? 0.38 : 1 }}>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{m.month_name}</td>
                <td><span className="amount" style={{ color: m.opening_balance >= 0 ? 'var(--green)' : 'var(--red)' }}>₹{fmt(Math.abs(m.opening_balance))}</span></td>
                <td><span className="amount" style={{ color: 'var(--green)', fontWeight: 500 }}>₹{fmt(m.aavak)}</span></td>
                <td><span className="amount" style={{ color: 'var(--red)', fontWeight: 500 }}>₹{fmt(m.javak)}</span></td>
                <td><span className="amount" style={{ color: m.closing_balance >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>₹{fmt(Math.abs(m.closing_balance))}</span></td>
                <td><span className="amount" style={{ color: 'var(--blue)' }}>₹{fmt(m.udhar_gave_pending)}</span></td>
                <td><span className="amount" style={{ color: 'var(--yellow)' }}>₹{fmt(m.udhar_got_pending)}</span></td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid var(--border)', background: '#f9731608', fontWeight: 700 }}>
              <td style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Total</td>
              <td><span className="amount" style={{ color: 'var(--muted)' }}>—</span></td>
              <td><span className="amount" style={{ color: 'var(--green)' }}>₹{fmt(data.total_aavak)}</span></td>
              <td><span className="amount" style={{ color: 'var(--red)' }}>₹{fmt(data.total_javak)}</span></td>
              <td><span className="amount" style={{ color: data.net >= 0 ? 'var(--green)' : 'var(--red)' }}>₹{fmt(Math.abs(data.net))}</span></td>
              <td><span className="amount" style={{ color: 'var(--muted)' }}>—</span></td>
              <td><span className="amount" style={{ color: 'var(--muted)' }}>—</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}