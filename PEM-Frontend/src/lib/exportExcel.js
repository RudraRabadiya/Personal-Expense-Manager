import * as XLSX from 'xlsx'

const fmt     = n => Number(n || 0).toLocaleString('en-IN')
const fmtDate = d => (d ? d.split('-').reverse().join('/') : '-')


export function exportExcel(entries = [], udhar = [], filename = null) {
  const wb = XLSX.utils.book_new()


  const totalIncome  = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const netBalance   = totalIncome - totalExpense

  const entrySummary = [
    ['PEM — Entries Export', '', '', '', '', ''],
    ['Generated:', new Date().toLocaleDateString('en-IN'), '', '', '', ''],
    ['', '', '', '', '', ''],
    ['SUMMARY', '', '', '', '', ''],
    ['Total Income',  `Rs. ${fmt(totalIncome)}`,  '', 'Total Expense', `Rs. ${fmt(totalExpense)}`, ''],
    ['Net Balance',   `Rs. ${fmt(Math.abs(netBalance))}`, netBalance >= 0 ? '(Surplus)' : '(Deficit)', '', '', ''],
    ['', '', '', '', '', ''],
    ['Date', 'Type', 'Description', 'Category', 'Amount (Rs.)', 'Notes'],
  ]

  const entryRows = entries
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(e => [
      fmtDate(e.date),
      e.type === 'income' ? 'Income' : 'Expense',
      e.description || '',
      e.category || '',
      e.type === 'expense' ? -e.amount : e.amount,
      e.notes || '',
    ])

  const wsEntries = XLSX.utils.aoa_to_sheet([...entrySummary, ...entryRows])


  wsEntries['!cols'] = [
    { wch: 12 }, { wch: 10 }, { wch: 32 }, { wch: 18 }, { wch: 14 }, { wch: 20 },
  ]

  XLSX.utils.book_append_sheet(wb, wsEntries, 'Entries')


  const totalGave    = udhar.filter(u => u.type === 'gave').reduce((s, u) => s + u.amount, 0)
  const totalGot     = udhar.filter(u => u.type === 'got').reduce((s, u) => s + u.amount, 0)
  const pendingGave  = udhar.filter(u => u.type === 'gave' && u.status !== 'paid').reduce((s, u) => s + (u.amount - (u.paid_amount || 0)), 0)
  const pendingGot   = udhar.filter(u => u.type === 'got'  && u.status !== 'paid').reduce((s, u) => s + (u.amount - (u.paid_amount || 0)), 0)

  const udharSummary = [
    ['PEM — Udhar Export', '', '', '', '', '', ''],
    ['Generated:', new Date().toLocaleDateString('en-IN'), '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['SUMMARY', '', '', '', '', '', ''],
    ['Total Gave', `Rs. ${fmt(totalGave)}`, '', 'Total Got', `Rs. ${fmt(totalGot)}`, '', ''],
    ['Pending Gave', `Rs. ${fmt(pendingGave)}`, '', 'Pending Got', `Rs. ${fmt(pendingGot)}`, '', ''],
    ['', '', '', '', '', '', ''],
    ['Date', 'Type', 'Person', 'Description', 'Total (Rs.)', 'Paid (Rs.)', 'Remaining (Rs.)', 'Status'],
  ]

  const udharRows = udhar
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(u => [
      fmtDate(u.date),
      u.type === 'gave' ? 'Gave (Uchina Aapelu)' : 'Got (Uchina Lidhu)',
      u.person_name || '',
      u.description || '',
      u.amount,
      u.paid_amount || 0,
      u.amount - (u.paid_amount || 0),
      u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : '',
    ])

  const wsUdhar = XLSX.utils.aoa_to_sheet([...udharSummary, ...udharRows])

  wsUdhar['!cols'] = [
    { wch: 12 }, { wch: 22 }, { wch: 20 }, { wch: 28 },
    { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 10 },
  ]

  XLSX.utils.book_append_sheet(wb, wsUdhar, 'Udhar')


  const name = filename || `PEM_Export_${new Date().toISOString().slice(0, 10)}`
  XLSX.writeFile(wb, `${name}.xlsx`)
}
