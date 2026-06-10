import { useState } from 'react'
import api from '../lib/api'
import { LABELS } from '../lib/utils'
import toast from 'react-hot-toast'


const parseApiError = (err) => {
  const detail = err?.response?.data?.detail
  if (Array.isArray(detail)) return detail.map(d => d.msg || String(d)).join(', ')
  return typeof detail === 'string' ? detail : 'Something went wrong'
}


export default function AddUdharModal({ udhar = null, onClose, onSuccess }) {
  const isEdit = !!udhar
  const [type, setType] = useState(isEdit ? udhar.type : 'gave')
  const [form, setForm] = useState(isEdit ? {
    person_name:  udhar.person_name  || '',
    amount:       String(udhar.amount),
    description:  udhar.description  || '',
    date:         udhar.date         || new Date().toISOString().slice(0, 10),
    due_date:     udhar.due_date     || '',
    notes:        udhar.notes        || '',
  } : {
    person_name: '', amount: '', description: '',
    date: new Date().toISOString().slice(0, 10),
    due_date: '', notes: '',
  })
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!form.amount || !form.person_name) { toast.error('Fill all required fields'); return }
    const payload = {
      ...form,
      type,
      amount: parseFloat(form.amount),
      due_date: form.due_date || null,
    }
    setLoading(true)
    try {
      if (isEdit) {

        const updatePayload = {
          person_name: payload.person_name,
          amount:      payload.amount,
          description: payload.description,
          date:        payload.date,
          due_date:    payload.due_date,
          notes:       payload.notes,
        }
        await api.put(`/udhar/${udhar.id}`, updatePayload)
        toast.success('Udhar entry updated!')
      } else {
        await api.post('/udhar/', payload)
        toast.success('Udhar entry added!')
      }
      onSuccess(); onClose()
    } catch (err) {
      toast.error(parseApiError(err))
    } finally { setLoading(false) }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{isEdit ? '✏️ Edit Udhar Entry' : 'Add Udhar Entry'}</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {[
            ['gave', LABELS.gave,  'var(--blue)',   '#3b82f618'],
            ['got',  LABELS.got,   'var(--yellow)', '#eab30818'],
          ].map(([t, label, color, bg]) => (
            <button
              key={t}
              onClick={() => !isEdit && setType(t)}
              style={{
                flex: 1, padding: '9px', borderRadius: 10,
                border: `1.5px solid ${type === t ? color : 'var(--border)'}`,
                background: type === t ? bg : 'var(--bg)',
                color: type === t ? color : 'var(--muted)',
                fontWeight: 700, fontSize: '.85rem',
                cursor: isEdit ? 'default' : 'pointer',
                opacity: isEdit && type !== t ? 0.4 : 1,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="field">
          <label>Person Name</label>
          <input value={form.person_name} onChange={e => setForm({...form, person_name: e.target.value})} placeholder="Who gave / who took?" />
        </div>
        <div className="field">
          <label>Amount (₹)</label>
          <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" min="1" />
        </div>
        <div className="field">
          <label>Description</label>
          <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Reason..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>Entry Date</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="field">
            <label>Due Date <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              type="date"
              value={form.due_date}
              onChange={e => setForm({...form, due_date: e.target.value})}
              min={form.date}
              style={{ borderColor: form.due_date ? 'var(--yellow)' : undefined }}
            />
          </div>
        </div>
        <div className="field">
          <label>Notes</label>
          <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Extra info..." />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={loading}>
            {loading ? 'Saving…' : isEdit ? '✓ Update Udhar' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}