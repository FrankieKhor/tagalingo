import { Feather, Lock, Medal, Trophy, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import type {
	LeaderboardRowViewModel,
	LeaderboardViewModel,
	LeagueTier,
} from '@/lib/domain/models'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'

const tierStyles: Record<
	LeagueTier,
	{
		label: string
		medallion: string
		icon: string
	}
> = {
	bronze: {
		label: 'Bronze',
		medallion: 'border-orange-300 bg-orange-200 text-orange-700',
		icon: 'bg-orange-300/45 text-orange-800',
	},
	silver: {
		label: 'Silver',
		medallion: 'border-slate-300 bg-slate-100 text-slate-600',
		icon: 'bg-slate-200 text-slate-700',
	},
	gold: {
		label: 'Gold',
		medallion: 'border-amber-300 bg-amber-100 text-amber-600',
		icon: 'bg-amber-200 text-amber-700',
	},
	sapphire: {
		label: 'Sapphire',
		medallion: 'border-sky-300 bg-sky-100 text-sky-600',
		icon: 'bg-sky-200 text-sky-700',
	},
	ruby: {
		label: 'Ruby',
		medallion: 'border-rose-300 bg-rose-100 text-rose-600',
		icon: 'bg-rose-200 text-rose-700',
	},
	emerald: {
		label: 'Emerald',
		medallion: 'border-emerald-300 bg-emerald-100 text-emerald-600',
		icon: 'bg-emerald-200 text-emerald-700',
	},
	amethyst: {
		label: 'Amethyst',
		medallion: 'border-violet-300 bg-violet-100 text-violet-600',
		icon: 'bg-violet-200 text-violet-700',
	},
	pearl: {
		label: 'Pearl',
		medallion: 'border-cyan-200 bg-white text-cyan-600',
		icon: 'bg-cyan-100 text-cyan-700',
	},
	obsidian: {
		label: 'Obsidian',
		medallion: 'border-slate-500 bg-slate-800 text-white',
		icon: 'bg-slate-700 text-white',
	},
	diamond: {
		label: 'Diamond',
		medallion: 'border-cyan-300 bg-cyan-50 text-cyan-600',
		icon: 'bg-cyan-100 text-cyan-700',
	},
}

const placeholderRows = [
	{ nameWidth: 'w-16', xpWidth: 'w-12', opacity: 'opacity-55' },
	{ nameWidth: 'w-24', xpWidth: 'w-12', opacity: 'opacity-45' },
	{ nameWidth: 'w-12', xpWidth: 'w-12', opacity: 'opacity-35' },
	{ nameWidth: 'w-32', xpWidth: 'w-12', opacity: 'opacity-25' },
	{ nameWidth: 'w-20', xpWidth: 'w-12', opacity: 'opacity-15' },
	{ nameWidth: 'w-36', xpWidth: 'w-12', opacity: 'opacity-10' },
]

function LeagueBadge({
	tier,
	active,
	locked,
}: {
	tier: LeagueTier
	active: boolean
	locked: boolean
}) {
	const styles = tierStyles[tier]

	return (
		<div
			className={cn(
				'flex size-[58px] items-center justify-center rounded-[18px] border-4 shadow-[inset_0_-6px_0_rgba(15,23,42,0.08)] sm:size-[72px] sm:rounded-[22px]',
				active
					? styles.medallion
					: 'border-slate-200 bg-slate-100 text-slate-300 dark:border-white/10 dark:bg-white/8 dark:text-white/25'
			)}
			aria-label={`${styles.label} league${active ? ', current' : ''}`}
		>
			<div
				className={cn(
					'flex size-9 items-center justify-center rounded-2xl sm:size-11',
					active ? styles.icon : 'bg-slate-200 dark:bg-white/8'
				)}
			>
				{locked ? <Lock className="size-5" /> : <Feather className="size-5" />}
			</div>
		</div>
	)
}

function LeagueTrack({ view }: { view: LeaderboardViewModel }) {
	const visibleTiers = view.tiers.slice(0, 4)

	return (
		<div className="flex items-center justify-center gap-5 sm:gap-7">
			{visibleTiers.map((tier) => (
				<LeagueBadge
					key={tier.id}
					tier={tier.id}
					active={tier.active}
					locked={tier.locked}
				/>
			))}
		</div>
	)
}

function EmptyLeaderboardPreview({
	displayName,
	avatarEmoji,
}: {
	displayName: string
	avatarEmoji: string
}) {
	return (
		<div className="mx-auto w-full max-w-[640px]">
			<div className="space-y-4 px-6 pb-5 pt-10">
				{placeholderRows.map((row, index) => (
					<div
						key={`${row.nameWidth}-${index}`}
						className={cn(
							'grid grid-cols-[20px_54px_minmax(0,1fr)_64px] items-center gap-4',
							row.opacity
						)}
					>
						<div className="size-4 rounded-full bg-slate-300 dark:bg-white/15" />
						<div className="flex size-12 items-center justify-center rounded-full bg-slate-200 text-slate-300 dark:bg-white/10 dark:text-white/20">
							<UserRound className="size-7" />
						</div>
						<div className={cn('h-3 rounded-full bg-slate-300', row.nameWidth)} />
						<div className={cn('ml-auto h-3 rounded-full bg-slate-300', row.xpWidth)} />
					</div>
				))}
			</div>

			<div className="sticky bottom-24 grid grid-cols-[36px_56px_minmax(0,1fr)_72px] items-center gap-4 rounded-2xl bg-slate-100 px-7 py-4 text-slate-400 shadow-sm dark:bg-white/8 dark:text-white/45 lg:bottom-6">
				<p className="text-center text-lg font-black">-</p>
				<div className="relative flex size-11 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-white text-sm font-black dark:border-white/25 dark:bg-[#101f28]">
					<span aria-hidden="true">{avatarEmoji}</span>
					<span className="absolute -bottom-1 -right-1 size-2.5 rounded-full bg-lime-500 ring-2 ring-slate-100 dark:ring-[#1d2b34]" />
				</div>
				<p className="truncate text-sm font-black">{displayName}</p>
				<p className="text-right text-sm font-black">0 XP</p>
			</div>
		</div>
	)
}

function StandingsRow({ row }: { row: LeaderboardRowViewModel }) {
	return (
		<div
			className={cn(
				'grid grid-cols-[36px_54px_minmax(0,1fr)_72px] items-center gap-4 rounded-2xl px-5 py-3 transition',
				row.isPlayer
					? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-white/10 dark:text-white'
					: 'text-slate-500 hover:bg-slate-50 dark:text-white/60 dark:hover:bg-white/5'
			)}
		>
			<div
				className={cn(
					'flex size-8 items-center justify-center rounded-full text-sm font-black',
					row.rank <= 3
						? 'bg-amber-100 text-amber-600'
						: 'bg-transparent text-slate-400 dark:text-white/35'
				)}
			>
				{row.rank <= 3 ? <Medal className="size-4" /> : row.rank}
			</div>
			<div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-white/8">
				{row.avatarEmoji}
			</div>
			<div className="min-w-0">
				<p className="truncate text-sm font-black">{row.displayName}</p>
				{row.promotionZone ? (
					<p className="text-xs font-bold text-emerald-500">Promotion zone</p>
				) : row.demotionZone ? (
					<p className="text-xs font-bold text-rose-500">Demotion zone</p>
				) : null}
			</div>
			<p className="text-right text-sm font-black">{row.weeklyXp} XP</p>
		</div>
	)
}

function ActiveLeaderboard({ view }: { view: LeaderboardViewModel }) {
	return (
		<div className="mx-auto w-full max-w-[640px] space-y-2 pt-8">
			{view.rows.map((row) => (
				<StandingsRow key={row.id} row={row} />
			))}
		</div>
	)
}

export function LeaderboardsPage() {
	const view = useAppStore((state) => state.leaderboardView)
	const snapshot = useAppStore((state) => state.snapshot)

	return (
		<main className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-[760px] flex-col px-4 py-6 text-center sm:px-6 lg:min-h-screen lg:py-8">
			<LeagueTrack view={view} />

			<section className="mt-5 space-y-4">
				<div className="flex items-center justify-center gap-2">
					<Trophy className="size-6 text-orange-500" />
					<h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
						{view.currentLeagueLabel} League
					</h1>
				</div>

				<p className="text-base font-semibold text-slate-500 dark:text-white/60">
					{view.hasActiveCycle
						? view.timeRemainingLabel
							? `${view.timeRemainingLabel} left in this week's leaderboard`
							: "Keep earning XP to climb this week's leaderboard"
						: "Complete a lesson to join this week's leaderboard"}
				</p>

				<Button
					asChild
					variant="outline"
					className="h-12 w-full max-w-[260px] rounded-2xl border-2 border-slate-200 bg-white text-sm font-black uppercase text-sky-500 shadow-[0_3px_0_#e5e7eb] hover:bg-sky-50 hover:text-sky-600 dark:border-white/10 dark:bg-white/8 dark:shadow-none"
				>
					<Link to="/">{view.hasActiveCycle ? 'Earn more XP' : 'Start a lesson'}</Link>
				</Button>
			</section>

			{view.hasActiveCycle ? (
				<ActiveLeaderboard view={view} />
			) : (
				<EmptyLeaderboardPreview
					displayName={snapshot.profile.displayName}
					avatarEmoji={snapshot.profile.avatarEmoji}
				/>
			)}
		</main>
	)
}
