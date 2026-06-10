
export const LABELS = {
  expense: '💸 Javak',
  income: '💰 Aavak',
  gave: '🤝 Uchina Aapelu',
  got: '💳 Uchina Lidhu',
  appName: 'Personal Finance',
}


export const fmtDate = (d) => {
  if (!d) return '-'
  return d.split('-').reverse().join('/')
}


export const fmt = (n) => Number(n || 0).toLocaleString('en-IN')