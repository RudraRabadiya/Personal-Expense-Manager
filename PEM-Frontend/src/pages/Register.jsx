import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Registered! Please check your email to verify, then login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 70% 40%, #1f1635 0%, #0f1117 70%)' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '40px 36px', width: 380, boxShadow: '0 30px 80px #0007' }}>
        <div style={{ fontFamily: "'Baloo 2'", fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', textAlign: 'center', marginBottom: 24 }}>Create Account</div>
        <form onSubmit={handle}>
          <div className="field"><label>Full Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ravi Sharma" required /></div>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required /></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min 6 characters" required minLength={6} /></div>
          <div className="field"><label>Confirm Password</label><input type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="Repeat password" required /></div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: '.85rem', color: 'var(--muted)' }}>
          Have account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Login</Link>
        </div>
      </div>
    </div>
  )
}
