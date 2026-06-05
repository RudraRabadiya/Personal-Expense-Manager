import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const fmt     = n => Number(n || 0).toLocaleString('en-IN')
const fmtDate = d => d ? d.split('-').reverse().join('/') : '-'

// ── Colour palette (matches Cyber Emerald CSS theme) ──────────────────────────
const C = {
  bg:      [10,  11,  14],   // #0a0b0e
  surface: [18,  20,  26],   // #12141a
  border:  [39,  43,  56],   // #272b38
  accent:  [16,  185, 129],  // #10b981 emerald
  green:   [163, 230, 53],   // #a3e635 lime
  red:     [244, 63,  94],   // #f43f5e hot-pink
  blue:    [14,  165, 233],  // #0ea5e9 sky
  yellow:  [245, 158, 11],   // #f59e0b amber
  muted:   [100, 116, 139],  // #64748b
  text:    [226, 232, 240],  // #e2e8f0
}

// helper: draw a filled rounded-ish rect header band
function sectionHeader(doc, y, label, color) {
  doc.setFillColor(...color)
  doc.roundedRect(14, y, 182, 7, 1, 1, 'F')
  doc.setTextColor(10, 11, 14)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text(label.toUpperCase(), 18, y + 4.8)
  return y + 11
}

function statBox(doc, x, y, w, label, value, color) {
  doc.setFillColor(...C.surface)
  doc.roundedRect(x, y, w, 18, 1.5, 1.5, 'F')
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.3)
  doc.roundedRect(x, y, w, 18, 1.5, 1.5, 'S')

  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)
  doc.text(label.toUpperCase(), x + 4, y + 5.5)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...color)
  doc.text(value, x + 4, y + 13)
}

// ── MAIN EXPORT FUNCTION ──────────────────────────────────────────────────────
export function exportUserPDF(userData) {
  const { profile, summary, entries, udhar } = userData
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  // ── Page background ────────────────────────────────────────────────────────
  doc.setFillColor(...C.bg)
  doc.rect(0, 0, pageW, 297, 'F')

  // ── Top accent bar ─────────────────────────────────────────────────────────
  doc.setFillColor(...C.accent)
  doc.rect(0, 0, pageW, 2, 'F')

  // ── Title block ────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...C.text)
  doc.text('PEM', 14, 16)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)
  doc.text('Personal Finance Tracker  ·  Admin Export', 14, 22)

  // right-side user info
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.accent)
  doc.text(profile.name, pageW - 14, 14, { align: 'right' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)
  doc.text(profile.email, pageW - 14, 19, { align: 'right' })
  doc.text(`Role: ${profile.role.toUpperCase()}   ·   Generated: ${new Date().toLocaleDateString('en-IN')}`, pageW - 14, 24, { align: 'right' })

  // divider
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.4)
  doc.line(14, 28, pageW - 14, 28)

  // ── Summary Stats ──────────────────────────────────────────────────────────
  let y = 33
  const boxW = 40
  const gap  = 3
  const boxes = [
    { label: 'Total Income',    value: `Rs. ${fmt(summary.total_income)}`,    color: C.green  },
    { label: 'Total Expense',   value: `Rs. ${fmt(summary.total_expense)}`,   color: C.red    },
    { label: 'Net Balance',     value: `Rs. ${fmt(Math.abs(summary.net_balance))}`, color: summary.net_balance >= 0 ? C.green : C.red },
    { label: 'Udhar Gave (Due)',value: `Rs. ${fmt(summary.udhar_gave_pending)}`, color: C.blue },
    { label: 'Udhar Got (Due)', value: `Rs. ${fmt(summary.udhar_got_pending)}`, color: C.yellow },
  ]
  boxes.forEach((b, i) => statBox(doc, 14 + i * (boxW + gap), y, boxW, b.label, b.value, b.color))
  y += 24

  // ── Entries Table ──────────────────────────────────────────────────────────
  y = sectionHeader(doc, y, `Entries  (${entries.length})`, C.accent)

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Date', 'Type', 'Description', 'Category', 'Amount', 'Notes']],
    body: entries.map(e => [
      fmtDate(e.date),
      e.type.toUpperCase(),
      e.description,
      e.category || '-',
      (e.type === 'expense' ? '- ' : '+ ') + 'Rs. ' + fmt(e.amount),
      e.notes || '-',
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 3,
      fillColor: C.surface,
      textColor: C.text,
      lineColor: C.border,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C.border,
      textColor: C.muted,
      fontStyle: 'bold',
      fontSize: 6.5,
    },
    alternateRowStyles: { fillColor: [14, 16, 22] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 18, fontStyle: 'bold' },
      4: { fontStyle: 'bold', halign: 'right' },
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 1) {
        const t = data.row.raw[1]
        data.cell.styles.textColor = t === 'INCOME' ? C.green : C.red
      }
      if (data.section === 'body' && data.column.index === 4) {
        const v = data.row.raw[4]
        data.cell.styles.textColor = v.startsWith('-') ? C.red : C.green
      }
    },
  })

  y = doc.lastAutoTable.finalY + 8

  // ── Udhar Table ────────────────────────────────────────────────────────────
  // Add new page if not enough space
  if (y > 240) { doc.addPage(); doc.setFillColor(...C.bg); doc.rect(0, 0, pageW, 297, 'F'); y = 14 }

  y = sectionHeader(doc, y, `Udhar Book  (${udhar.length})`, C.blue)

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Date', 'Type', 'Person', 'Total', 'Paid', 'Remaining', 'Status']],
    body: udhar.map(u => [
      fmtDate(u.date),
      u.type.toUpperCase(),
      u.person_name,
      'Rs. ' + fmt(u.amount),
      'Rs. ' + fmt(u.paid_amount || 0),
      'Rs. ' + fmt(u.amount - (u.paid_amount || 0)),
      u.status.toUpperCase(),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 3,
      fillColor: C.surface,
      textColor: C.text,
      lineColor: C.border,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C.border,
      textColor: C.muted,
      fontStyle: 'bold',
      fontSize: 6.5,
    },
    alternateRowStyles: { fillColor: [14, 16, 22] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 18, fontStyle: 'bold' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell(data) {
      if (data.section === 'body') {
        if (data.column.index === 1) {
          data.cell.styles.textColor = data.row.raw[1] === 'GAVE' ? C.blue : C.yellow
        }
        if (data.column.index === 4) data.cell.styles.textColor = C.green
        if (data.column.index === 5) data.cell.styles.textColor = C.red
        if (data.column.index === 6) {
          const s = data.row.raw[6]
          data.cell.styles.textColor = s === 'PAID' ? C.green : s === 'PARTIAL' ? C.yellow : C.muted
        }
      }
    },
  })

  // ── Footer on every page ───────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(...C.bg)
    doc.rect(0, 285, pageW, 12, 'F')
    doc.setDrawColor(...C.border)
    doc.setLineWidth(0.3)
    doc.line(14, 286, pageW - 14, 286)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.muted)
    doc.text('PEM  ·  Confidential Admin Export', 14, 291)
    doc.text(`Page ${i} of ${totalPages}`, pageW - 14, 291, { align: 'right' })
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const filename = `${profile.name.replace(/\s+/g, '_')}_PEM_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
