import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { StreakFlame } from '@/components/common/streak-flame'
import { StatPill } from '@/components/common/stat-pill'
import {
	getNextStreakTier,
	getStreakTier,
	getStreakWeekActivity,
	streakTiers,
} from '@/lib/domain/streak'
import { cn } from '@/lib/utils'

type TopStatusBarProps = {
	xp: number
	points: number
	streak: number
	hearts: number
	lastActiveOn?: string
	loading?: boolean
}

function SpanishFlagBadge() {
	return (
		<div
			className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-[#c8102e] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_18px_rgba(0,0,0,0.18)] sm:size-10"
			aria-label="Spanish course"
			role="img"
		>
			<div className="absolute inset-x-0 top-[24%] h-[52%] bg-[#ffcd00]" />
			<div className="relative z-10 h-4 w-2 rounded-sm border border-[#ad1519]/70 bg-[#f8fafc] shadow-sm">
				<div className="mx-auto mt-0.5 h-2 w-1 rounded-[2px] bg-[#ad1519]" />
			</div>
		</div>
	)
}

function StreakHoverPanel({
	streak,
	lastActiveOn,
	onClose,
}: {
	streak: number
	lastActiveOn?: string
	onClose: () => void
}) {
	const tier = getStreakTier(streak)
	const nextTier = getNextStreakTier(streak)
	const weekActivity = getStreakWeekActivity({ streak, lastActiveOn })
	const hasStreak = streak > 0
	const remainingDays = nextTier
		? Math.max(0, nextTier.minDays - streak)
		: undefined
	const previewTiers = streakTiers.filter((item) => item.id !== 'ember')

	return (
		<div
			role="dialog"
			aria-label="Streak details"
			className="absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-[min(calc(100vw-1.5rem),24rem)] -translate-x-1/2 rounded-[24px] border border-white/14 bg-[#16242e] text-white shadow-[0_24px_70px_rgba(0,0,0,0.42)] sm:right-0 sm:left-auto sm:w-[24rem] sm:translate-x-0"
		>
			<div className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-l border-t border-white/14 bg-[#16242e] sm:left-auto sm:right-11 sm:translate-x-0" />
			<div className="relative overflow-hidden rounded-[24px]">
				<div className="flex items-start justify-between gap-4 border-b border-white/8 bg-white/[0.03] px-5 py-5">
					<div className="min-w-0">
						<p className="text-2xl font-black text-white sm:text-3xl">
							{streak} day streak
						</p>
						<p className="mt-3 max-w-[15rem] text-base font-bold leading-7 text-white/82">
							{hasStreak
								? 'Keep your streak alive with one lesson today.'
								: 'Do a lesson today to start a new streak.'}
						</p>
					</div>
					<div className="flex shrink-0 flex-col items-center">
						<StreakFlame
							streak={streak}
							className="size-20"
							title={`${tier.label} streak flame`}
						/>
						<p className="mt-1 text-xs font-black uppercase text-white/50">
							{tier.shortLabel}
						</p>
					</div>
				</div>

				<div className="bg-[#101c24] px-5 py-5">
					<div className="mb-4 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
						<div className="flex items-center justify-between gap-3">
							<p className="text-sm font-black text-white">Flame milestones</p>
							<p className="text-xs font-bold text-white/46">Preview</p>
						</div>
						<div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
							{previewTiers.map((previewTier) => {
								const isCurrentTier = tier.id === previewTier.id

								return (
									<div
										key={previewTier.id}
										className={cn(
											'flex min-w-0 flex-col items-center rounded-2xl border border-white/8 bg-[#0b1720] px-2 py-3 text-center',
											isCurrentTier &&
												'border-sky-300/60 bg-sky-400/10 shadow-[0_0_0_1px_rgba(125,211,252,0.2)]'
										)}
									>
										<StreakFlame
											streak={previewTier.minDays}
											className="size-9"
											title={`${previewTier.label} preview`}
										/>
										<p className="mt-2 text-[0.68rem] font-black uppercase leading-none text-white/78">
											{previewTier.minDays}d
										</p>
										<p className="mt-1 truncate text-[0.66rem] font-semibold text-white/42">
											{previewTier.shortLabel}
										</p>
									</div>
								)
							})}
						</div>
					</div>

					<div className="rounded-[18px] bg-[#0b1720] p-4">
						<div className="grid grid-cols-7 gap-2 text-center">
							{weekActivity.map((day) => (
								<div key={day.date} className="min-w-0">
									<p
										className={cn(
											'text-xs font-black text-white/46',
											day.isToday && 'text-amber-300'
										)}
									>
										{day.label}
									</p>
									<div
										className={cn(
											'mt-2 flex aspect-square items-center justify-center rounded-full bg-slate-600/60',
											day.isActive &&
												'bg-gradient-to-br from-orange-300 to-orange-600 shadow-[0_0_0_4px_rgba(251,146,60,0.12)]',
											day.isToday &&
												'ring-2 ring-amber-300/80 ring-offset-2 ring-offset-[#0b1720]'
										)}
										aria-label={`${day.label} ${day.isActive ? 'active' : 'inactive'}`}
									>
										{day.isActive ? (
											<StreakFlame streak={streak} className="size-5" />
										) : null}
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
						<p className="text-sm font-black text-white">
							{nextTier
								? `${remainingDays} more day${remainingDays === 1 ? '' : 's'} to unlock ${nextTier.label.toLowerCase()}.`
								: 'You have reached the top streak flame.'}
						</p>
						<p className="mt-1 text-sm leading-6 text-white/62">
							Weekly milestones change the flame image in your header.
						</p>
					</div>

					<Link
						to="/"
						onClick={onClose}
						className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-sky-400 px-5 text-sm font-black uppercase text-[#071722] shadow-[inset_0_-3px_0_rgba(8,47,73,0.18)] transition hover:bg-sky-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
					>
						Start lesson
					</Link>
				</div>
			</div>
		</div>
	)
}

function StreakStatusItem({
	streak,
	lastActiveOn,
}: {
	streak: number
	lastActiveOn?: string
}) {
	const [open, setOpen] = useState(false)
	const itemRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (!open) {
			return
		}

		function handlePointerDown(event: PointerEvent) {
			if (
				itemRef.current &&
				event.target instanceof Node &&
				!itemRef.current.contains(event.target)
			) {
				setOpen(false)
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setOpen(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [open])

	return (
		<div
			ref={itemRef}
			className="relative"
			onPointerEnter={(event) => {
				if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
					setOpen(true)
				}
			}}
			onPointerLeave={(event) => {
				if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
					setOpen(false)
				}
			}}
			onFocus={() => setOpen(true)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) {
					setOpen(false)
				}
			}}
		>
			<button
				type="button"
				className={cn(
					'flex h-11 min-w-[4.3rem] items-center justify-center gap-2 rounded-2xl px-2.5 text-white transition hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 sm:h-12 sm:min-w-[5rem] sm:px-3',
					open && 'bg-white/8'
				)}
				aria-expanded={open}
				aria-haspopup="dialog"
				onClick={() => setOpen((current) => !current)}
			>
				<StreakFlame
					streak={streak}
					className="size-8 sm:size-9"
					title={`${streak} day streak`}
				/>
				<span className="text-base font-black sm:text-lg">
					{streak.toLocaleString()}
				</span>
			</button>
			{open ? (
				<StreakHoverPanel
					streak={streak}
					lastActiveOn={lastActiveOn}
					onClose={() => setOpen(false)}
				/>
			) : null}
		</div>
	)
}

export function TopStatusBar({
	xp,
	points,
	streak,
	hearts,
	lastActiveOn,
	loading = false,
}: TopStatusBarProps) {
	return (
		<div className="sticky top-0 z-40 border-b border-white/8 bg-[#09131d]/90 backdrop-blur-xl">
			<div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-3 py-2 sm:px-4 lg:px-8">
				<div className="flex min-w-0 items-center gap-2 sm:gap-3">
					<SpanishFlagBadge />
					<div className="hidden min-w-0 lg:block">
						<p className="text-sm font-black text-white">Tagalingo</p>
						<p className="truncate text-xs font-semibold text-white/52">
							Spanish course
						</p>
					</div>
				</div>
				<div className="flex min-w-0 items-center gap-1 sm:gap-2">
					{loading ? (
						<div className="hidden rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-2 text-xs font-black uppercase text-sky-100 sm:block">
							Syncing
						</div>
					) : null}
					<StatPill kind="xp" value={xp} className="hidden sm:flex" />
					<StreakStatusItem streak={streak} lastActiveOn={lastActiveOn} />
					<StatPill kind="points" value={points} />
					<StatPill kind="hearts" value={hearts} />
				</div>
			</div>
		</div>
	)
}
