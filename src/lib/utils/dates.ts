const DAY_MS = 24 * 60 * 60 * 1000

export function toISODate(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function shiftISODate(isoDate: string, days: number): string {
  const date = new Date(isoDate)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export function differenceInDays(left: string, right: string): number {
  const leftTime = new Date(left).setHours(0, 0, 0, 0)
  const rightTime = new Date(right).setHours(0, 0, 0, 0)

  return Math.round((leftTime - rightTime) / DAY_MS)
}

export function isDue(dueAt: string, now = new Date()): boolean {
  return new Date(dueAt).getTime() <= now.getTime()
}
