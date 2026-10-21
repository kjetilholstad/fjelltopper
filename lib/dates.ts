const TIME_ZONE = 'Europe/Oslo'

/** Dato som YYYY-MM-DD i norsk tid (ikke UTC). */
export function dateLocal(date: Date = new Date()): string {
  return date.toLocaleDateString('sv-SE', { timeZone: TIME_ZONE })
}

export function todayLocal(): string {
  return dateLocal()
}
