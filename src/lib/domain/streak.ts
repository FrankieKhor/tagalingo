import { differenceInDays, shiftISODate, toISODate } from '@/lib/utils/dates'

export type StreakTierId =
	| 'ember'
	| 'red'
	| 'blue'
	| 'purple'
	| 'gold'
	| 'emerald'
	| 'diamond'

export type StreakTier = {
	id: StreakTierId
	label: string
	shortLabel: string
	minDays: number
	iconWrap: string
	primary: string
	secondary: string
	glow: string
}

export const streakTiers: StreakTier[] = [
	{
		id: 'ember',
		label: 'Fresh start',
		shortLabel: 'Start',
		minDays: 0,
		iconWrap: 'text-slate-500',
		primary: '#64748b',
		secondary: '#334155',
		glow: '#94a3b8',
	},
	{
		id: 'red',
		label: 'Red flame',
		shortLabel: 'Day streak',
		minDays: 1,
		iconWrap: 'text-orange-300',
		primary: '#ff6b00',
		secondary: '#ffd34d',
		glow: '#fb923c',
	},
	{
		id: 'blue',
		label: 'Blue flame',
		shortLabel: '1 week',
		minDays: 7,
		iconWrap: 'text-sky-300',
		primary: '#1d9bf0',
		secondary: '#b8f3ff',
		glow: '#38bdf8',
	},
	{
		id: 'purple',
		label: 'Purple flame',
		shortLabel: '2 weeks',
		minDays: 14,
		iconWrap: 'text-violet-300',
		primary: '#8b5cf6',
		secondary: '#f0abfc',
		glow: '#a78bfa',
	},
	{
		id: 'gold',
		label: 'Gold flame',
		shortLabel: '30 days',
		minDays: 30,
		iconWrap: 'text-amber-300',
		primary: '#f59e0b',
		secondary: '#fff176',
		glow: '#fbbf24',
	},
	{
		id: 'emerald',
		label: 'Emerald flame',
		shortLabel: '60 days',
		minDays: 60,
		iconWrap: 'text-emerald-300',
		primary: '#10b981',
		secondary: '#a7f3d0',
		glow: '#34d399',
	},
	{
		id: 'diamond',
		label: 'Diamond flame',
		shortLabel: '100 days',
		minDays: 100,
		iconWrap: 'text-cyan-200',
		primary: '#06b6d4',
		secondary: '#f0f9ff',
		glow: '#a78bfa',
	},
]

export function getStreakTier(streak: number) {
	const normalized = Math.max(0, streak)

	return (
		[...streakTiers].reverse().find((tier) => normalized >= tier.minDays) ??
		streakTiers[0]
	)
}

export function getNextStreakTier(streak: number) {
	return streakTiers.find((tier) => tier.minDays > streak)
}

export function getStreakWeekActivity({
	streak,
	lastActiveOn,
	today = toISODate(),
}: {
	streak: number
	lastActiveOn?: string
	today?: string
}) {
	const todayDate = new Date(today)
	const day = todayDate.getDay()
	const mondayOffset = day === 0 ? -6 : 1 - day
	const weekStart = shiftISODate(today, mondayOffset)
	const activeEnd = lastActiveOn
	const activeRangeLength = Math.max(0, streak)
	const canShowActivity =
		Boolean(activeEnd) &&
		activeRangeLength > 0 &&
		differenceInDays(today, activeEnd as string) <= 1
	const activeStart =
		canShowActivity && activeEnd
			? shiftISODate(activeEnd, -(activeRangeLength - 1))
			: undefined

	return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => {
		const date = shiftISODate(weekStart, index)
		const isActive =
			Boolean(activeStart && activeEnd) &&
			differenceInDays(date, activeStart as string) >= 0 &&
			differenceInDays(activeEnd as string, date) >= 0
		const isToday = date === today

		return {
			date,
			label,
			isActive,
			isToday,
		}
	})
}
