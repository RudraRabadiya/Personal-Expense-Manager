import { useState } from 'react'
import api from '../lib/api'
import { LABELS } from '../lib/utils'
import toast from 'react-hot-toast'


const parseApiError = (err) => {
  const detail = err?.response?.data?.detail
  if (Array.isArray(detail)) return detail.map(d => d.msg || String(d)).join(', ')
  return typeof detail === 'string' ? detail : 'Something went wrong'
}

const EXPENSE_CATS = ['Food','Transport','Bills','Shopping','Health','Entertainment','Education','Other']
const INCOME_CATS  = ['Salary','Freelance','Business','Investment','Gift','Other']


export default function AddEntryModal({ type: defaultType = 'expense', entry = null, onClose, onSuccess }) {
  const isEdit = !!entry
  const [type, setType] = useState(isEdit ? entry.type : defaultType)
  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS
  const [form, setForm] = useState(isEdit ? {
    amount:      String(entry.amount),
    description: entry.description || '',
    category:    entry.category    || cats[0],
    date:        entry.date        || new Date().toISOString().slice(0, 10),
    notes:       entry.notes       || '',
  } : {
    amount: '', description: '', category: cats[0],
    date: new Date().toISOString().slice(0, 10), notes: '',
  })
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!form.amount || !form.description || !form.date) {
      toast.error('Fill all required fields'); return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await api.put(`/entries/${entry.id}`, {
          ...form, amount: parseFloat(form.amount),
        })
        toast.success('Entry updated!')
      } else {
        await api.post('/entries/', { ...form, type, amount: parseFloat(form.amount) })
        toast.success('Entry added!')
      }
      onSuccess(); onClose()
    } catch (err) {
      toast.error(parseApiError(err))
    } finally { setLoading(false) }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{isEdit ? '✏️ Edit Entry' : 'Add Entry'}</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {[
            ['expense', LABELS.expense, 'var(--red)',   '#ef444418'],
            ['income',  LABELS.income,  'var(--green)', '#22c55e18'],
          ].map(([t, label, color, bg]) => (
            <button
              key={t}
              onClick={() => {
                if (isEdit) return
                setType(t)
                const newCats = t === 'income' ? INCOME_CATS : EXPENSE_CATS
                setForm(prev => ({ ...prev, category: newCats[0] }))
              }}
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
          <label>Amount (₹)</label>
          <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" min="1" />
        </div>
        <div className="field">
          <label>Description</label>
          <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Grocery, Salary..." />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        </div>
        <div className="field">
          <label>Notes (optional)</label>
          <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Extra info..." />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={loading}>
            {loading ? 'Saving…' : isEdit ? '✓ Update Entry' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}