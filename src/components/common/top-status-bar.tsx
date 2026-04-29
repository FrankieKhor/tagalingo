import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Gem, Heart, RefreshCw, ShoppingBag } from 'lucide-react'

import { StreakFlame } from '@/components/common/streak-flame'
import { MAX_HEARTS } from '@/lib/domain/progress'
import type { ProgressSnapshot, ShopItemId } from '@/lib/domain/models'
import {
	getNextStreakTier,
	getStreakTier,
	getStreakWeekActivity,
	streakTiers,
} from '@/lib/domain/streak'
import { cn } from '@/lib/utils'

type TopStatusBarProps = {
	points: number
	streak: number
	hearts: number
	inventory: ProgressSnapshot['inventory']
	lastActiveOn?: string
	saving?: boolean
	loading?: boolean
	useShopItem: (
		itemId: Extract<ShopItemId, 'heart-refill' | 'heart-snack'>
	) => Promise<ProgressSnapshot>
}

type ActiveStatusPopover = 'streak' | 'gems' | 'hearts' | null

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
	open,
	onOpenChange,
}: {
	streak: number
	lastActiveOn?: string
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const itemRef = useRef<HTMLDivElement | null>(null)
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
				onOpenChange(false)
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				onOpenChange(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [onOpenChange, open])

	useEffect(() => {
		return () => {
			if (closeTimerRef.current) {
				clearTimeout(closeTimerRef.current)
			}
		}
	}, [])

	function clearHoverClose() {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current)
			closeTimerRef.current = null
		}
	}

	function scheduleHoverClose() {
		clearHoverClose()
		closeTimerRef.current = setTimeout(() => {
			onOpenChange(false)
		}, 180)
	}

	return (
		<div
			ref={itemRef}
			className="relative"
			onPointerEnter={(event) => {
				if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
					clearHoverClose()
					onOpenChange(true)
				}
			}}
			onPointerLeave={(event) => {
				if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
					scheduleHoverClose()
				}
			}}
			onFocus={() => onOpenChange(true)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) {
					onOpenChange(false)
				}
			}}
		>
			<button
				type="button"
				className={cn(
					'flex h-11 min-w-[4.3rem] items-center justify-center gap-2 rounded-2xl px-2.5 text-slate-800 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 sm:h-12 sm:min-w-[5rem] sm:px-3 dark:text-white dark:hover:bg-white/8',
					open && 'bg-slate-100 dark:bg-white/8'
				)}
				aria-expanded={open}
				aria-haspopup="dialog"
				onClick={() => onOpenChange(!open)}
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
					onClose={() => onOpenChange(false)}
				/>
			) : null}
		</div>
	)
}

function GemsHoverPanel({
	points,
	onClose,
}: {
	points: number
	onClose: () => void
}) {
	return (
		<div
			role="dialog"
			aria-label="Gems details"
			className="absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-[min(calc(100vw-1.5rem),24rem)] -translate-x-1/2 rounded-[24px] border border-white/14 bg-[#16242e] text-white shadow-[0_24px_70px_rgba(0,0,0,0.42)] sm:right-0 sm:left-auto sm:w-[24rem] sm:translate-x-0"
		>
			<div className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-l border-t border-white/14 bg-[#16242e] sm:left-auto sm:right-11 sm:translate-x-0" />
			<div className="relative overflow-hidden rounded-[24px]">
				<div className="flex items-center gap-4 bg-[#101c24] px-5 py-5">
					<div className="flex size-20 shrink-0 items-center justify-center rounded-[22px] border border-cyan-200/20 bg-cyan-400/12 text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
						<Gem className="size-11 fill-current" />
					</div>
					<div className="min-w-0">
						<p className="text-2xl font-black text-white">Gems</p>
						<p className="mt-2 text-base font-black text-white/86">
							You have {points.toLocaleString()} gems
						</p>
						<Link
							to="/shop"
							onClick={onClose}
							className="mt-4 inline-flex text-sm font-black uppercase text-cyan-300 transition hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
						>
							Go to shop
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

function GemsStatusItem({
	points,
	open,
	onOpenChange,
}: {
	points: number
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const itemRef = useRef<HTMLDivElement | null>(null)
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
				onOpenChange(false)
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				onOpenChange(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [onOpenChange, open])

	useEffect(() => {
		return () => {
			if (closeTimerRef.current) {
				clearTimeout(closeTimerRef.current)
			}
		}
	}, [])

	function clearHoverClose() {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current)
			closeTimerRef.current = null
		}
	}

	function scheduleHoverClose() {
		clearHoverClose()
		closeTimerRef.current = setTimeout(() => {
			onOpenChange(false)
		}, 180)
	}

	return (
		<div
			ref={itemRef}
			className="relative"
			onPointerEnter={(event) => {
				if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
					clearHoverClose()
					onOpenChange(true)
				}
			}}
			onPointerLeave={(event) => {
				if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
					scheduleHoverClose()
				}
			}}
			onFocus={() => onOpenChange(true)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) {
					onOpenChange(false)
				}
			}}
		>
			<button
				type="button"
				className={cn(
					'flex h-11 min-w-[4.3rem] items-center justify-center gap-2 rounded-2xl px-2.5 text-slate-800 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 sm:h-12 sm:min-w-[5rem] sm:px-3 dark:text-white dark:hover:bg-white/8',
					open && 'bg-slate-100 dark:bg-white/8'
				)}
				aria-expanded={open}
				aria-haspopup="dialog"
				aria-label={`${points.toLocaleString()} gems`}
				onClick={() => onOpenChange(!open)}
			>
				<span className="flex size-8 items-center justify-center rounded-full bg-cyan-500/18 text-cyan-300 sm:size-9">
					<Gem className="size-5 fill-current" />
				</span>
				<span className="text-base font-black text-cyan-300 sm:text-lg">
					{points.toLocaleString()}
				</span>
			</button>
			{open ? (
				<GemsHoverPanel points={points} onClose={() => onOpenChange(false)} />
			) : null}
		</div>
	)
}

function HeartMeter({ hearts }: { hearts: number }) {
	return (
		<div className="flex items-center justify-center gap-2" aria-hidden="true">
			{Array.from({ length: MAX_HEARTS }, (_, index) => {
				const filled = index < hearts

				return (
					<Heart
						key={index}
						className={cn(
							'size-7 fill-current stroke-none',
							filled ? 'text-rose-500' : 'text-white/16'
						)}
					/>
				)
			})}
		</div>
	)
}

function HeartActionButton({
	title,
	description,
	icon,
	meta,
	disabled,
	loading,
	onClick,
}: {
	title: string
	description: string
	icon: ReactNode
	meta?: string
	disabled?: boolean
	loading?: boolean
	onClick: () => void
}) {
	return (
		<button
			type="button"
			disabled={disabled || loading}
			onClick={onClick}
			className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-white/12 bg-[#101c24] px-4 py-3 text-left transition hover:border-white/22 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-white/12 disabled:hover:bg-[#101c24]"
		>
			<span className="flex min-w-0 items-center gap-3">
				<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/6 text-white">
					{icon}
				</span>
				<span className="min-w-0">
					<span className="block text-sm font-black uppercase text-white">
						{title}
					</span>
					<span className="mt-0.5 block truncate text-xs font-semibold text-white/55">
						{description}
					</span>
				</span>
			</span>
			{meta ? (
				<span className="shrink-0 text-xs font-black uppercase text-white/62">
					{loading ? 'Using...' : meta}
				</span>
			) : null}
		</button>
	)
}

function HeartActionLink({
	to,
	title,
	description,
	icon,
	onClose,
}: {
	to: string
	title: string
	description: string
	icon: ReactNode
	onClose: () => void
}) {
	return (
		<Link
			to={to}
			onClick={onClose}
			className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white/12 bg-[#101c24] px-4 py-3 text-left transition hover:border-white/22 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
		>
			<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/6 text-white">
				{icon}
			</span>
			<span className="min-w-0">
				<span className="block text-sm font-black uppercase text-white">
					{title}
				</span>
				<span className="mt-0.5 block truncate text-xs font-semibold text-white/55">
					{description}
				</span>
			</span>
		</Link>
	)
}

function HeartsHoverPanel({
	hearts,
	inventory,
	saving,
	onUseShopItem,
	onClose,
}: {
	hearts: number
	inventory: ProgressSnapshot['inventory']
	saving: boolean
	onUseShopItem: TopStatusBarProps['useShopItem']
	onClose: () => void
}) {
	const isFull = hearts >= MAX_HEARTS
	const refillCount = inventory['heart-refill'] ?? 0
	const snackCount = inventory['heart-snack'] ?? 0

	function handleUseItem(
		itemId: Extract<ShopItemId, 'heart-refill' | 'heart-snack'>
	) {
		void onUseShopItem(itemId)
			.then(() => {
				onClose()
			})
			.catch(() => undefined)
	}

	return (
		<div
			role="dialog"
			aria-label="Hearts details"
			className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(calc(100vw-1.5rem),24rem)] rounded-[24px] border border-white/14 bg-[#16242e] text-white shadow-[0_24px_70px_rgba(0,0,0,0.42)]"
		>
			<div className="absolute -top-2 right-8 size-4 rotate-45 border-l border-t border-white/14 bg-[#16242e]" />
			<div className="relative overflow-hidden rounded-[24px]">
				<div className="border-b border-white/8 bg-white/[0.03] px-5 py-5 text-center">
					<p className="text-2xl font-black text-white">Hearts</p>
					<div className="mt-5">
						<HeartMeter hearts={hearts} />
					</div>
					<p className="mt-5 text-base font-black text-white">
						{isFull
							? 'You have full hearts'
							: `${hearts} of ${MAX_HEARTS} hearts left`}
					</p>
					<p className="mt-2 text-sm font-semibold text-white/62">
						{isFull ? 'Keep on learning' : 'Refill before your next lesson'}
					</p>
				</div>

				<div className="space-y-3 bg-[#101c24] px-5 py-5">
					<HeartActionButton
						title="Heart Refill"
						description={
							refillCount > 0 ? 'Restore all hearts now' : 'Buy one in the shop'
						}
						icon={
							<Heart className="size-5 fill-rose-500 text-rose-500 stroke-none" />
						}
						meta={refillCount > 0 ? `${refillCount} owned` : '0 owned'}
						disabled={isFull || refillCount <= 0}
						loading={saving}
						onClick={() => handleUseItem('heart-refill')}
					/>
					<HeartActionButton
						title="Heart Snack"
						description={
							snackCount > 0 ? 'Recover 2 hearts now' : 'Buy one in the shop'
						}
						icon={
							<Heart className="size-5 fill-rose-500 text-rose-500 stroke-none" />
						}
						meta={snackCount > 0 ? `${snackCount} owned` : '0 owned'}
						disabled={isFull || snackCount <= 0}
						loading={saving}
						onClick={() => handleUseItem('heart-snack')}
					/>
					<HeartActionLink
						to="/review"
						title="Practice"
						description="Review words and keep momentum"
						icon={<RefreshCw className="size-5" />}
						onClose={onClose}
					/>
					<HeartActionLink
						to="/shop"
						title="Shop"
						description="Get more refill items"
						icon={<ShoppingBag className="size-5" />}
						onClose={onClose}
					/>
				</div>
			</div>
		</div>
	)
}

function HeartStatusItem({
	hearts,
	inventory,
	saving,
	onUseShopItem,
	open,
	onOpenChange,
}: {
	hearts: number
	inventory: ProgressSnapshot['inventory']
	saving: boolean
	onUseShopItem: TopStatusBarProps['useShopItem']
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const itemRef = useRef<HTMLDivElement | null>(null)
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
				onOpenChange(false)
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				onOpenChange(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [onOpenChange, open])

	useEffect(() => {
		return () => {
			if (closeTimerRef.current) {
				clearTimeout(closeTimerRef.current)
			}
		}
	}, [])

	function clearHoverClose() {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current)
			closeTimerRef.current = null
		}
	}

	function scheduleHoverClose() {
		clearHoverClose()
		closeTimerRef.current = setTimeout(() => {
			onOpenChange(false)
		}, 180)
	}

	return (
		<div
			ref={itemRef}
			className="relative"
			onPointerEnter={(event) => {
				if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
					clearHoverClose()
					onOpenChange(true)
				}
			}}
			onPointerLeave={(event) => {
				if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
					scheduleHoverClose()
				}
			}}
			onFocus={() => onOpenChange(true)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) {
					onOpenChange(false)
				}
			}}
		>
			<button
				type="button"
				className={cn(
					'flex h-11 min-w-[4.3rem] items-center justify-center gap-2 rounded-2xl px-2.5 text-slate-800 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 sm:h-12 sm:min-w-[5rem] sm:px-3 dark:text-white dark:hover:bg-white/8',
					open && 'bg-slate-100 dark:bg-white/8'
				)}
				aria-expanded={open}
				aria-haspopup="dialog"
				aria-label={`${hearts} of ${MAX_HEARTS} hearts`}
				onClick={() => onOpenChange(!open)}
			>
				<Heart className="size-7 fill-rose-500 text-rose-500 stroke-none sm:size-8" />
				<span className="text-base font-black text-rose-500 dark:text-rose-300 sm:text-lg">
					{hearts.toLocaleString()}
				</span>
			</button>
			{open ? (
				<HeartsHoverPanel
					hearts={hearts}
					inventory={inventory}
					saving={saving}
					onUseShopItem={onUseShopItem}
					onClose={() => onOpenChange(false)}
				/>
			) : null}
		</div>
	)
}

export function TopStatusBar({
	points,
	streak,
	hearts,
	inventory,
	lastActiveOn,
	saving = false,
	loading = false,
	useShopItem,
}: TopStatusBarProps) {
	const [activePopover, setActivePopover] = useState<ActiveStatusPopover>(null)

	function setPopoverOpen(popover: Exclude<ActiveStatusPopover, null>) {
		return (open: boolean) => {
			setActivePopover((current) => {
				if (open) {
					return popover
				}

				return current === popover ? null : current
			})
		}
	}

	return (
		<div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/82 backdrop-blur-xl dark:border-white/8 dark:bg-[#09131d]/90">
			<div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-3 py-2 sm:px-4 lg:px-8">
				<div aria-hidden="true" />
				<div className="flex min-w-0 items-center gap-1 sm:gap-2">
					{loading ? (
						<div className="hidden rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black uppercase text-sky-700 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-100 sm:block">
							Syncing
						</div>
					) : null}
					<StreakStatusItem
						streak={streak}
						lastActiveOn={lastActiveOn}
						open={activePopover === 'streak'}
						onOpenChange={setPopoverOpen('streak')}
					/>
					<GemsStatusItem
						points={points}
						open={activePopover === 'gems'}
						onOpenChange={setPopoverOpen('gems')}
					/>
					<HeartStatusItem
						hearts={hearts}
						inventory={inventory}
						saving={saving}
						onUseShopItem={useShopItem}
						open={activePopover === 'hearts'}
						onOpenChange={setPopoverOpen('hearts')}
					/>
				</div>
			</div>
		</div>
	)
}
