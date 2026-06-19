
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


export function getDueDays(due_date) {
  if (!due_date) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due   = new Date(due_date); due.setHours(0, 0, 0, 0)
  return Math.round((due - today) / (1000 * 60 * 60 * 24))
}