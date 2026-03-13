/**
 * Recurrence utilities for FlowDesk
 * recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly_day' | 'custom_days'
 * recurrence_value:
 *   - daily: interval in days (ex: 1 = every day, 2 = every 2 days)
 *   - weekly: interval in weeks (ex: 1 = every week, 2 = every 2 weeks)
 *   - monthly_day: day of month (ex: 15 = every 15th)
 *   - custom_days: interval in days (alias of daily, for UI clarity)
 */

export function computeNextOccurrence(type, value, fromDate = new Date()) {
  const base = new Date(fromDate)
  base.setHours(0, 0, 0, 0)

  switch (type) {
    case 'daily':
    case 'custom_days': {
      const next = new Date(base)
      next.setDate(next.getDate() + (value || 1))
      return next.toISOString().split('T')[0]
    }
    case 'weekly': {
      const next = new Date(base)
      next.setDate(next.getDate() + (value || 1) * 7)
      return next.toISOString().split('T')[0]
    }
    case 'monthly_day': {
      const next = new Date(base)
      next.setMonth(next.getMonth() + 1)
      next.setDate(value || 1)
      return next.toISOString().split('T')[0]
    }
    default:
      return null
  }
}

export function recurrenceLabel(type, value) {
  switch (type) {
    case 'daily': return value === 1 ? 'Tous les jours' : `Tous les ${value} jours`
    case 'custom_days': return `Tous les ${value} jours`
    case 'weekly': return value === 1 ? 'Toutes les semaines' : `Toutes les ${value} semaines`
    case 'monthly_day': return `Le ${value} de chaque mois`
    default: return null
  }
}

export function recurrenceIcon(type) {
  return type && type !== 'none' ? '🔁' : null
}
