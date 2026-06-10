import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Profile() {
  const { user, refreshUser } = useAuth()


  const [name, setName]           = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)


  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [savingPw, setSavingPw]   = useState(false)

  const handleUpdateName = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name cannot be empty')
    if (name.trim() === user?.name) return toast('No changes made', { icon: 'ℹ️' })
    setSavingName(true)
    try {
      await api.patch('/auth/profile', { name: name.trim() })
      await refreshUser()
      toast.success('Name updated successfully!')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update name')
    } finally {
      setSavingName(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!newPw) return toast.error('Please enter a new password')
    if (newPw.length < 6) return toast.error('Password must be at least 6 characters')
    if (newPw !== confirmPw) return toast.error('Passwords do not match')
    setSavingPw(true)
    try {
      await api.patch('/auth/password', { new_password: newPw })
      toast.success('Password updated! Please log in again if needed.')
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update password')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div>
      <div className="page-header fade-up">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-subtitle">Manage your account settings</div>
        </div>
      </div>

      <div className="card fade-up fade-up-1" style={{ marginBottom: 24 }}>
        <div style={{ padding: '28px 28px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem',
            color: '#fff', flexShrink: 0,
            boxShadow: '0 0 30px var(--accent-dim)',
          }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {user?.name}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 3 }}>
              {user?.email}
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{
                background: user?.role === 'admin' ? 'var(--accent-dim)' : 'var(--blue-dim)',
                color: user?.role === 'admin' ? 'var(--accent)' : 'var(--blue)',
                border: `1px solid ${user?.role === 'admin' ? 'var(--border-glow)' : '#0ea5e930'}`,
                padding: '3px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        <div className="card fade-up fade-up-2">
          <div className="card-header">
            <div className="card-title">✏️ Update Name</div>
          </div>
          <form onSubmit={handleUpdateName} style={{ padding: '24px 28px' }}>
            <div className="field">
              <label htmlFor="profile-name">Display Name</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.55, cursor: 'not-allowed' }}
              />
            </div>
            <div style={{ marginTop: 20 }}>
              <button
                id="save-name-btn"
                type="submit"
                className="btn btn-primary"
                disabled={savingName}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {savingName ? '⏳ Saving…' : '✓ Save Name'}
              </button>
            </div>
          </form>
        </div>

        <div className="card fade-up fade-up-3">
          <div className="card-header">
            <div className="card-title">🔒 Change Password</div>
          </div>
          <form onSubmit={handleUpdatePassword} style={{ padding: '24px 28px' }}>
            <div className="field">
              <label htmlFor="new-password">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="new-password"
                  type={showPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--muted)', fontSize: '0.85rem', padding: 0,
                  }}
                  title={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type={showPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
              {confirmPw && (
                <div style={{
                  marginTop: 6, fontSize: '0.75rem', fontWeight: 600,
                  color: newPw === confirmPw ? 'var(--green)' : 'var(--red)',
                }}>
                  {newPw === confirmPw ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>
            <div style={{ marginTop: 20 }}>
              <button
                id="save-password-btn"
                type="submit"
                className="btn btn-primary"
                disabled={savingPw}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {savingPw ? '⏳ Updating…' : '🔑 Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card fade-up fade-up-4" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">ℹ️ Account Info</div>
        </div>
        <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { label: 'User ID',    value: user?.id     ? `${user.id.slice(0, 8)}…` : '—' },
            { label: 'Role',       value: user?.role   || '—' },
            { label: 'Full Name',  value: user?.name   || '—' },
            { label: 'Email',      value: user?.email  || '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-dim)', wordBreak: 'break-all' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
