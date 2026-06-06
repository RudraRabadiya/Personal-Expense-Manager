import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register, verifyRegistration, resendOtp } = useAuth()
  const navigate = useNavigate()

  // Step 1: form fields
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  // Step 2: OTP state
  const [step, setStep] = useState(1)           // 1 = form, 2 = OTP
  const [userId, setUserId] = useState(null)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef([])
  const timerRef = useRef(null)

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    }
    return () => clearTimeout(timerRef.current)
  }, [resendCooldown])

  // Auto-focus first OTP box when step changes
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
      setResendCooldown(60)
    }
  }, [step])

  // ── Step 1: Register ──
  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const data = await register(form.name, form.email, form.password)
      setUserId(data.user_id)
      setStep(2)
      toast.success('Account created! Check your email for the verification code.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  // ── OTP input handling ──
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return   // only digits
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
    // Auto-submit when all 6 filled
    if (value && index === 5 && next.every(d => d !== '')) {
      handleVerify(next.join(''))
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
      handleVerify(pasted)
    }
  }

  // ── Step 2: Verify OTP ──
  const handleVerify = async (code) => {
    const finalCode = code || otp.join('')
    if (finalCode.length < 6) { toast.error('Please enter all 6 digits'); return }
    setVerifying(true)
    try {
      await verifyRegistration(userId, finalCode)
      toast.success('Email verified! You can now log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired code')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } finally { setVerifying(false) }
  }

  // ── Resend OTP ──
  const handleResend = async () => {
    if (resendCooldown > 0) return
    try {
      await resendOtp(userId)
      toast.success('New code sent to your email!')
      setResendCooldown(60)
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } catch (err) {
      toast.error('Failed to resend code. Please try again.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ overflow: 'hidden' }}>

        {/* ── STEP 1: Registration Form ── */}
        {step === 1 && (
          <div style={{ animation: 'fadeSlideIn 0.3s ease' }}>
            <div className="auth-logo">₹ PEM</div>
            <div className="auth-tagline">Create your free account</div>

            <form onSubmit={handleRegister}>
              <div className="field">
                <label>Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ravi Sharma"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat password"
                  required
                  autoComplete="new-password"
                />
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: 4 }}
                disabled={loading}
                id="register-submit"
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span className="spinner" style={{ borderTopColor: '#fff', width: 16, height: 16 }} />
                    Creating account…
                  </span>
                ) : 'Create Account →'}
              </button>
            </form>

            <div className="auth-divider">
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        )}

        {/* ── STEP 2: OTP Verification ── */}
        {step === 2 && (
          <div style={{ animation: 'fadeSlideIn 0.35s ease', textAlign: 'center' }}>
            {/* Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 28
            }}>
              📧
            </div>

            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              Check your email
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>
              We sent a 6-digit code to
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: 28 }}>
              {form.email}
            </div>

            {/* 6-digit OTP input */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  style={{
                    width: 46, height: 54,
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                    background: 'var(--surface)',
                    border: `2px solid ${digit ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 10,
                    color: 'var(--text)',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    caretColor: 'var(--accent)',
                  }}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginBottom: 16 }}
              onClick={() => handleVerify()}
              disabled={verifying || otp.some(d => d === '')}
              id="otp-verify-btn"
            >
              {verifying ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner" style={{ borderTopColor: '#fff', width: 16, height: 16 }} />
                  Verifying…
                </span>
              ) : 'Verify Email →'}
            </button>

            {/* Resend */}
            <div style={{ fontSize: '0.83rem', color: 'var(--muted)' }}>
              Didn't receive it?{' '}
              {resendCooldown > 0 ? (
                <span style={{ color: 'var(--muted)' }}>Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: 'inherit', padding: 0 }}
                >
                  Resend code
                </button>
              )}
            </div>

            {/* Back link */}
            <div style={{ marginTop: 20, fontSize: '0.82rem' }}>
              <button
                onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']) }}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline' }}
              >
                ← Use a different email
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
