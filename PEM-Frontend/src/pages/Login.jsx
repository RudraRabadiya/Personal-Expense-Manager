import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LABELS } from '../lib/utils'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 30% 40%, #1f1635 0%, #0f1117 70%)' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '40px 36px', width: 380, boxShadow: '0 30px 80px #0007' }}>
        <div style={{ fontFamily: "'Baloo 2'", fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', textAlign: 'center', marginBottom: 4 }}>📒 {LABELS.appName}</div>
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.88rem', marginBottom: 28 }}>Personal Finance Tracker</div>
        <form onSubmit={handle}>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required /></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required /></div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: '.85rem', color: 'var(--muted)' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>Register</Link>
        </div>
      </div>
    </div>
  )
}