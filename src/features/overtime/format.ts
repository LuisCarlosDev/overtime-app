export function formatDecimalHours(value: string | number) {
  const total = Number(value)
  if (Number.isNaN(total)) return '0:00'

  const hours = Math.floor(total)
  const minutes = Math.round((total - hours) * 60)

  return `${hours}:${String(minutes).padStart(2, '0')}`
}

export function statusLabel(status: 'pending' | 'paid') {
  return status === 'paid' ? 'Pago' : 'Aguardando pagamento'
}

export function progressStatusLabel(endTime: string | null) {
  return endTime ? 'Concluído' : 'Em andamento'
}

export function todayInputValue() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function combineDateAndTime(date: string, time: string) {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm, 0, 0)
}

export const STANDARD_WORK_HOURS = 8
export const MAX_OVERTIME_HOURS = 2

export function hoursBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime()
  if (ms <= 0) return 0
  return Math.round((ms / 3_600_000) * 100) / 100
}

export function calculateOvertimeHours(start: Date, end: Date) {
  const worked = hoursBetween(start, end)
  if (worked <= 0) return 0

  const overtime = Math.round((worked - STANDARD_WORK_HOURS) * 100) / 100
  if (overtime <= 0) return 0

  return Math.min(overtime, MAX_OVERTIME_HOURS)
}
