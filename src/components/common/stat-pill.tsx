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
				'flex min-w-0 items-center gap-1.5 rounded-2xl px-0.5 py-1 text-white sm:gap-3 sm:px-1',
				className
			)}
		>
			<div
				className={cn(
					'flex size-8 items-center justify-center rounded-full border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:size-10',
					item.iconWrap
				)}
			>
				<Icon className="size-4 fill-current sm:size-5" />
			</div>
			<div className="leading-tight max-[359px]:hidden">
				<p className="text-base font-black tracking-tight text-white sm:text-xl">
					{value.toLocaleString()}
				</p>
				<p className="hidden text-xs font-medium text-white/65 sm:block">
					{item.label}
				</p>
			</div>
		</div>
	)
}
