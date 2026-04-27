import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const fmt = n => Number(n||0).toLocaleString('en-IN')

export default function PaymentModal({ udhar, onClose, onSuccess }) {
  const [payments, setPayments] = useState([])
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const remaining = udhar.amount - (udhar.paid_amount || 0)

  const loadPayments = async () => {
    const res = await api.get(`/udhar/${udhar.id}/payments/`)
    setPayments(res.data)
  }

  useEffect(() => { loadPayments() }, [])

  const addPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter valid amount'); return }
    setLoading(true)
    try {
      const res = await api.post(`/udhar/${udhar.id}/payments/`, {
        amount: parseFloat(amount), date, notes
      })
      toast.success(`₹${fmt(amount)} payment recorded!`)
      setAmount(''); setNotes('')
      loadPayments()
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add payment')
    } finally { setLoading(false) }
  }

  const deletePayment = async (pid) => {
    if (!confirm('Delete this payment?')) return
    await api.delete(`/udhar/${udhar.id}/payments/${pid}`)
    toast.success('Payment deleted')
    loadPayments(); onSuccess()
  }

  const paidTotal = payments.reduce((s,p) => s+p.amount, 0)
  const pct = Math.min(100, Math.round((paidTotal / udhar.amount) * 100))

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{width: 500}}>
        <div className="modal-title">💳 Part Payment</div>

        {/* Udhar Info */}
        <div style={{background:'var(--surface2)',borderRadius:12,padding:'14px 16px',marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontWeight:700}}>{udhar.person_name}</span>
            <span style={{color:udhar.type==='gave'?'var(--blue)':'var(--yellow)',fontWeight:800}}>₹{fmt(udhar.amount)}</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'.82rem',color:'var(--muted)',marginBottom:10}}>
            <span>Paid: <strong style={{color:'var(--green)'}}>₹{fmt(paidTotal)}</strong></span>
            <span>Remaining: <strong style={{color:'var(--red)'}}>₹{fmt(udhar.amount - paidTotal)}</strong></span>
          </div>
          {/* Progress bar */}
          <div style={{background:'var(--border)',borderRadius:20,height:8,overflow:'hidden'}}>
            <div style={{width:`${pct}%`,height:'100%',background:`linear-gradient(90deg, var(--green), #16a34a)`,borderRadius:20,transition:'width .4s'}}></div>
          </div>
          <div style={{textAlign:'right',fontSize:'.75rem',color:'var(--muted)',marginTop:4}}>{pct}% paid</div>
        </div>

        {/* Add Payment */}
        {udhar.status !== 'paid' && (
          <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px',marginBottom:20}}>
            <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem'}}>Add Payment</div>
            <div style={{display:'flex',gap:10,marginBottom:10}}>
              <div className="field" style={{flex:1,margin:0}}>
                <label>Amount (₹)</label>
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder={`Max ₹${fmt(udhar.amount - paidTotal)}`} max={udhar.amount - paidTotal} />
              </div>
              <div className="field" style={{flex:1,margin:0}}>
                <label>Date</label>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
              </div>
            </div>
            <div className="field" style={{margin:0,marginBottom:10}}>
              <label>Notes (optional)</label>
              <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="e.g. Cash, UPI, partial..." />
            </div>
            <button className="btn btn-primary" style={{width:'100%'}} onClick={addPayment} disabled={loading}>
              {loading ? 'Adding...' : '+ Record Payment'}
            </button>
          </div>
        )}

        {/* Payment History */}
        <div style={{fontWeight:700,marginBottom:10,fontSize:'.9rem'}}>Payment History</div>
        {payments.length ? (
          <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:200,overflowY:'auto'}}>
            {payments.map(p=>(
              <div key={p.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--surface2)',borderRadius:10,padding:'10px 14px'}}>
                <div>
                  <div style={{fontWeight:700,color:'var(--green)'}}>₹{fmt(p.amount)}</div>
                  <div style={{fontSize:'.78rem',color:'var(--muted)'}}>{p.date} {p.notes && `· ${p.notes}`}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={()=>deletePayment(p.id)}>✕</button>
              </div>
            ))}
          </div>
        ) : <div className="empty" style={{padding:'20px'}}>No payments yet</div>}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}