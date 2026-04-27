import { useState } from 'react'
import api from '../lib/api'
import { LABELS } from '../lib/utils'
import toast from 'react-hot-toast'

export default function AddUdharModal({ onClose, onSuccess }) {
  const [type, setType] = useState('gave')
  const [form, setForm] = useState({ person_name: '', amount: '', description: '', date: new Date().toISOString().slice(0,10), notes: '' })
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!form.amount || !form.person_name) { toast.error('Fill all required fields'); return }
    setLoading(true)
    try {
      await api.post('/udhar/', { ...form, type, amount: parseFloat(form.amount) })
      toast.success('Udhar entry added!')
      onSuccess(); onClose()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">Add Udhar Entry</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {[['gave', LABELS.gave, 'var(--blue)', '#3b82f618'], ['got', LABELS.got, 'var(--yellow)', '#eab30818']].map(([t, label, color, bg]) => (
            <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: '9px', borderRadius: 10, border: `1.5px solid ${type===t ? color : 'var(--border)'}`, background: type===t ? bg : 'var(--bg)', color: type===t ? color : 'var(--muted)', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="field"><label>Person Name</label><input value={form.person_name} onChange={e=>setForm({...form,person_name:e.target.value})} placeholder="Who gave / who took?" /></div>
        <div className="field"><label>Amount (₹)</label><input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0.00" min="1" /></div>
        <div className="field"><label>Description</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Reason..." /></div>
        <div className="field"><label>Date</label><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></div>
        <div className="field"><label>Notes</label><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Extra info..." /></div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={loading}>{loading?'Saving...':'Save'}</button>
        </div>
      </div>
    </div>
  )
}