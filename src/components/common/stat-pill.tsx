import { Coins, Flame, Heart, Star } from 'lucide-react'

import { cn } from '@/lib/utils'

type StatPillProps = {
	kind: 'xp' | 'points' | 'streak' | 'hearts'
	value: number
	className?: string
}

const config = {
	xp: {
		label: 'xp',
		icon: Star,
		iconWrap: 'bg-amber-500/18 text-amber-300',
	},
	points: {
		label: 'gems',
		icon: Coins,
		iconWrap: 'bg-cyan-500/18 text-cyan-300',
	},
	streak: {
		label: 'day streak',
		icon: Flame,
		iconWrap: 'bg-orange-500/18 text-orange-300',
	},
	hearts: {
		label: 'lives',
		icon: Heart,
		iconWrap: 'bg-rose-500/18 text-rose-300',
	},
} as const

export function StatPill({ kind, value, className }: StatPillProps) {
	const item = config[kind]
	const Icon = item.icon

	return (
		<div
			className={cn(
				'flex items-center gap-3 rounded-2xl px-1 py-1 text-white',
				className
			)}
		>
			<div
				className={cn(
					'flex size-10 items-center justify-center rounded-full border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
					item.iconWrap
				)}
			>
				<Icon className="size-5 fill-current" />
			</div>
			<div className="leading-tight">
				<p className="text-xl font-black tracking-tight text-white">
					{value.toLocaleString()}
				</p>
				<p className="text-xs font-medium text-white/65">{item.label}</p>
			</div>
		</div>
	)
}
