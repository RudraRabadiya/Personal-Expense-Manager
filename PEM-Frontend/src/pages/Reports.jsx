import { useEffect, useState } from 'react'
import api from '../lib/api'
import { fmt, fmtDate, LABELS } from '../lib/utils'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Reports() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [view, setView] = useState('monthly')
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const url = view === 'monthly'
        ? `/reports/monthly?year=${year}&month=${month}`
        : `/reports/yearly?year=${year}`
      const res = await api.get(url)
      setData(res.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [view, year, month])

  const years = Array.from({length: 5}, (_, i) => currentYear - i)

  return (
    <div>
      <div className="page-title">📈 Reports</div>

      {/* Controls */}
      <div style={{display:'flex',gap:10,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',gap:6}}>
          {['monthly','yearly'].map(v=>(
            <button key={v} className={`btn btn-sm ${view===v?'btn-primary':'btn-secondary'}`} onClick={()=>setView(v)}>
              {v==='monthly'?'📅 Monthly':'📊 Yearly'}
            </button>
          ))}
        </div>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:9,padding:'8px 12px',color:'var(--text)'}}>
          {years.map(y=><option key={y}>{y}</option>)}
        </select>
        {view==='monthly' && (
          <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:9,padding:'8px 12px',color:'var(--text)'}}>
            {MONTHS.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
          </select>
        )}
      </div>

      {loading && <div className="empty">Loading...</div>}
      {!loading && data && view==='monthly' && <MonthlyView data={data} />}
      {!loading && data && view==='yearly' && <YearlyView data={data} />}
    </div>
  )
}

function MonthlyView({ data }) {
  return (
    <div>
      <div style={{fontFamily:"'Baloo 2'",fontSize:'1.2rem',fontWeight:800,marginBottom:16,color:'var(--muted)'}}>
        {data.month_name} {data.year}
      </div>

      {/* Balance Flow */}
      <div className="stat-grid" style={{marginBottom:24}}>
        <div className="stat-card">
          <div className="stat-label">Opening Balance</div>
          <div className="stat-value" style={{color:data.opening_balance>=0?'var(--green)':'var(--red)'}}>₹{fmt(Math.abs(data.opening_balance))}</div>
          <div className="stat-sub">Carried from last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">+ {LABELS.income}</div>
          <div className="stat-value" style={{color:'var(--green)'}}>₹{fmt(data.aavak)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">− {LABELS.expense}</div>
          <div className="stat-value" style={{color:'var(--red)'}}>₹{fmt(data.javak)}</div>
        </div>
        <div className="stat-card" style={{border:'1.5px solid var(--accent)'}}>
          <div className="stat-label">Closing Balance</div>
          <div className="stat-value" style={{color:data.closing_balance>=0?'var(--green)':'var(--red)'}}>₹{fmt(Math.abs(data.closing_balance))}</div>
          <div className="stat-sub">Carries to next month</div>
        </div>
      </div>

      {/* Udhar Summary */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}}>
        <div className="stat-card">
          <div className="stat-label">{LABELS.gave} Pending</div>
          <div className="stat-value" style={{color:'var(--blue)'}}>₹{fmt(data.udhar_gave_pending)}</div>
          <div className="stat-sub">Milva nu baki</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{LABELS.got} Pending</div>
          <div className="stat-value" style={{color:'var(--yellow)'}}>₹{fmt(data.udhar_got_pending)}</div>
          <div className="stat-sub">Aapva nu baki</div>
        </div>
      </div>

      {/* Entries this month */}
      <div className="card" style={{marginBottom:16}}>
        <div className="card-header"><div className="card-title">Entries this month ({data.entries.length})</div></div>
        {data.entries.length ? (
          <table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead><tbody>
            {data.entries.map(e=>(
              <tr key={e.id}>
                <td>{fmtDate(e.date)}</td>
                <td><span className={`chip chip-${e.type}`}>{e.type==='income'?LABELS.income:LABELS.expense}</span></td>
                <td>{e.description}</td>
                <td style={{color:'var(--muted)',fontSize:'.8rem'}}>{e.category}</td>
                <td style={{color:e.type==='expense'?'var(--red)':'var(--green)',fontWeight:700}}>₹{fmt(e.amount)}</td>
              </tr>
            ))}
          </tbody></table>
        ) : <div className="empty">No entries this month</div>}
      </div>

      {/* Udhar this month */}
      <div className="card">
        <div className="card-header"><div className="card-title">Udhar this month ({data.udhar_this_month.length})</div></div>
        {data.udhar_this_month.length ? (
          <table><thead><tr><th>Date</th><th>Type</th><th>Person</th><th>Total</th><th>Paid</th><th>Remaining</th><th>Status</th></tr></thead><tbody>
            {data.udhar_this_month.map(u=>(
              <tr key={u.id}>
                <td>{fmtDate(u.date)}</td>
                <td><span className={`chip chip-${u.type}`}>{u.type==='gave'?LABELS.gave:LABELS.got}</span></td>
                <td style={{fontWeight:700}}>{u.person_name}</td>
                <td>₹{fmt(u.amount)}</td>
                <td style={{color:'var(--green)',fontWeight:700}}>₹{fmt(u.paid_amount||0)}</td>
                <td style={{color:'var(--red)',fontWeight:700}}>₹{fmt(u.amount-(u.paid_amount||0))}</td>
                <td><span className={`chip chip-${u.status}`}>{u.status}</span></td>
              </tr>
            ))}
          </tbody></table>
        ) : <div className="empty">No udhar entries this month</div>}
      </div>
    </div>
  )
}

function YearlyView({ data }) {
  return (
    <div>
      <div style={{fontFamily:"'Baloo 2'",fontSize:'1.2rem',fontWeight:800,marginBottom:16,color:'var(--muted)'}}>
        Year {data.year} Summary
      </div>

      {/* Year totals */}
      <div className="stat-grid" style={{marginBottom:24}}>
        <div className="stat-card">
          <div className="stat-label">Opening Balance</div>
          <div className="stat-value" style={{color:data.opening_balance>=0?'var(--green)':'var(--red)'}}>₹{fmt(Math.abs(data.opening_balance))}</div>
          <div className="stat-sub">Start of {data.year}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total {LABELS.income}</div>
          <div className="stat-value" style={{color:'var(--green)'}}>₹{fmt(data.total_aavak)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total {LABELS.expense}</div>
          <div className="stat-value" style={{color:'var(--red)'}}>₹{fmt(data.total_javak)}</div>
        </div>
        <div className="stat-card" style={{border:'1.5px solid var(--accent)'}}>
          <div className="stat-label">Closing Balance</div>
          <div className="stat-value" style={{color:data.closing_balance>=0?'var(--green)':'var(--red)'}}>₹{fmt(Math.abs(data.closing_balance))}</div>
          <div className="stat-sub">End of {data.year}</div>
        </div>
      </div>

      {/* Month by month table */}
      <div className="card">
        <div className="card-header"><div className="card-title">Month by Month</div></div>
        <table>
          <thead>
            <tr><th>Month</th><th>Opening</th><th>{LABELS.income}</th><th>{LABELS.expense}</th><th>Closing</th><th>Udhar Gave</th><th>Udhar Got</th></tr>
          </thead>
          <tbody>
            {data.months.map(m=>(
              <tr key={m.month} style={{opacity: m.aavak===0&&m.javak===0?0.4:1}}>
                <td style={{fontWeight:700}}>{m.month_name}</td>
                <td style={{color:m.opening_balance>=0?'var(--green)':'var(--red)'}}>₹{fmt(Math.abs(m.opening_balance))}</td>
                <td style={{color:'var(--green)',fontWeight:700}}>₹{fmt(m.aavak)}</td>
                <td style={{color:'var(--red)',fontWeight:700}}>₹{fmt(m.javak)}</td>
                <td style={{color:m.closing_balance>=0?'var(--green)':'var(--red)',fontWeight:700}}>₹{fmt(Math.abs(m.closing_balance))}</td>
                <td style={{color:'var(--blue)'}}>₹{fmt(m.udhar_gave_pending)}</td>
                <td style={{color:'var(--yellow)'}}>₹{fmt(m.udhar_got_pending)}</td>
              </tr>
            ))}
            {/* Total row */}
            <tr style={{borderTop:'2px solid var(--border)',fontWeight:800,background:'var(--surface2)'}}>
              <td>Total</td>
              <td>-</td>
              <td style={{color:'var(--green)'}}>₹{fmt(data.total_aavak)}</td>
              <td style={{color:'var(--red)'}}>₹{fmt(data.total_javak)}</td>
              <td style={{color:data.net>=0?'var(--green)':'var(--red)'}}>₹{fmt(Math.abs(data.net))}</td>
              <td>-</td><td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}