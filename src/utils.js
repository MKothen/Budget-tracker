import { parseISO, startOfDay, addDays, addWeeks, addMonths, isBefore } from 'date-fns'

export function computeAmountFromHours(hours, rate) {
  const h = Number(hours || 0)
  const r = Number(rate || 0)
  return Math.round((h * r) * 100) / 100
}

export function summarizeMonth(events) {
  let income = 0, expense = 0
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  events.forEach(e => {
    const d = new Date(e.date)
    if (d.getMonth() === month && d.getFullYear() === year) {
      if (e.amount >= 0) income += Number(e.amount)
      else expense += Math.abs(Number(e.amount))
    }
  })
  return { income, expense }
}

export function expandRecurringEvents(events, monthsAhead = 12) {
  const out = []
  const now = startOfDay(new Date())
  const endDate = addMonths(now, monthsAhead)
  events.forEach(e => {
    if (!e.recurring) {
      out.push({ ...e, date: e.date, originalEvent: e })
    } else {
      let current = startOfDay(new Date(e.date))
      const recurringEnds = e.recurringEnds ? startOfDay(new Date(e.recurringEnds)) : null
      while (current <= endDate && (!recurringEnds || current <= recurringEnds)) {
        if (current >= now) {
          out.push({ ...e, date: current.toISOString().slice(0,10), originalEvent: e })
        }
        if (e.recurring === 'weekly') current = addWeeks(current, 1)
        else if (e.recurring === 'biweekly') current = addWeeks(current, 2)
        else current = addMonths(current, 1)
      }
    }
  })
  out.sort((a,b) => new Date(a.date) - new Date(b.date))
  return out
}

// Forecast cashflow for monthsAhead months; returns daily balances
export function forecastCashflow(events, monthsAhead = 6, startingBalance = 0) {
  const expanded = expandRecurringEvents(events, monthsAhead)
  // build map date -> net change
  const map = {}
  expanded.forEach(e => {
    const key = (new Date(e.date)).toISOString().slice(0,10)
    map[key] = (map[key] || 0) + Number(e.amount || 0)
  })
  const out = []
  const today = startOfDay(new Date())
  let running = Number(startingBalance || 0)
  const totalDays = Math.ceil(30 * monthsAhead)
  for (let i=0;i<totalDays;i++) {
    const d = addDays(today, i)
    const key = d.toISOString().slice(0,10)
    running += (map[key] || 0)
    out.push({ date: d, balance: running })
  }
  return out
}

// Compute next 60 days (for chart compatibility)
export function computeDailyBalances(events) {
  return forecastCashflow(events, 2, 0)
}

// detect risk days where balance < threshold (e.g., 0)
export function detectRiskDays(dailyBalances, threshold = 0) {
  return dailyBalances.filter(d => d.balance < threshold)
}
