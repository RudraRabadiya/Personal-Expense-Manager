// ── Display Labels ──
export const LABELS = {
  expense: '💸 Javak',
  income: '💰 Aavak',
  gave: '🤝 Uchina Aapelu',
  got: '💳 Uchina Lidhu',
  appName: 'Personal Finance',
}

// ── Date format: yyyy-mm-dd → dd/mm/yyyy ──
export const fmtDate = (d) => {
  if (!d) return '-'
  return d.split('-').reverse().join('/')
}

// ── Amount format ──
export const fmt = (n) => Number(n || 0).toLocaleString('en-IN')