import {
	BookOpen,
	Check,
	FastForward,
	Gift,
	Lock,
	Play,
	Star,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import type {
	LearnPathMarkerViewModel,
	LearnPathNodeViewModel,
	LearnUnitViewModel,
} from '@/lib/domain/models'
import { cn } from '@/lib/utils'

type LessonItem = LearnPathNodeViewModel
type GuidebookItem = LearnPathMarkerViewModel & { nodeType: 'guidebook' }
type RewardItem = LearnPathMarkerViewModel & {
	nodeType: 'reward'
	chestState: 'locked' | 'ready' | 'opened'
}
type MarkerItem = GuidebookItem | RewardItem
type DisplayItem = LessonItem | MarkerItem
export type LearnPathTone = {
	availableNode: string
	completedNode: string
	currentNode: string
	guidebookNode: string
	calloutText: string
	calloutSurface: string
	path: string
	pathFirst: string
}

const desktopOffsets = [0, 88, -78, 96, -64, 56]
const mobileOffsets = [0, 16, -8, 14, -10, 8]
const desktopCenterX = 360
const desktopWidth = 760
const rowGap = 148
const topPadding = 88

function isLessonItem(item: DisplayItem): item is LessonItem {
	return item.nodeType === 'lesson'
}

function isGuidebookItem(item: DisplayItem): item is GuidebookItem {
	return item.nodeType === 'guidebook'
}

function isRewardItem(item: DisplayItem): item is RewardItem {
	return item.nodeType === 'reward'
}

function getLessonPosition(item: LessonItem) {
	const lessons = item.unit.categories.flatMap((category) => category.lessons)
	return lessons.findIndex((lesson) => lesson.id === item.lesson.id) + 1
}

function getLessonXp(item: LessonItem) {
	return item.lesson.exercises.reduce(
		(total, exercise) => total + exercise.xp,
		0
	)
}

function getDisplayItems(
	unitView: LearnUnitViewModel,
	activeLessonId?: string
): DisplayItem[] {
	return unitView.items.reduce<DisplayItem[]>((items, item) => {
		if (item.nodeType === 'category-label') {
			return items
		}

		if (item.nodeType === 'guidebook') {
			items.push(item as GuidebookItem)
			return items
		}

		if (item.nodeType === 'reward') {
			items.push({
				...(item as LearnPathMarkerViewModel),
				nodeType: 'reward',
				chestState: item.chestState ?? 'locked',
			})
			return items
		}

		const lessonItem = item as LessonItem
		items.push(
			lessonItem.lesson.id === activeLessonId &&
				lessonItem.state === 'available'
				? { ...lessonItem, state: 'current' }
				: lessonItem
		)

		return items
	}, [])
}

function getNodePalette(item: DisplayItem, tone: LearnPathTone) {
	if (isRewardItem(item)) {
		if (item.chestState === 'opened') {
			return tone.completedNode
		}

		if (item.chestState === 'ready') {
			return tone.currentNode
		}

		return 'border-white/10 bg-[#2a3542] text-white/55'
	}

	if (isGuidebookItem(item)) {
		return tone.guidebookNode
	}

	if (item.state === 'completed') {
		return tone.completedNode
	}

	if (item.state === 'current') {
		return tone.currentNode
	}

	if (item.state === 'available') {
		return tone.availableNode
	}

	if (item.state === 'jump') {
		return tone.availableNode
	}

	return 'border-white/10 bg-[#2a3542] text-white/60'
}

function getStatusLabel(item: DisplayItem) {
	if (isGuidebookItem(item)) {
		return 'Preview'
	}

	if (isRewardItem(item)) {
		if (item.chestState === 'opened') {
			return 'Collected'
		}

		if (item.chestState === 'ready') {
			return 'Open now'
		}

		return 'Earn XP'
	}

	if (item.state === 'completed') {
		return 'Complete'
	}

	if (item.state === 'current') {
		return `+${getLessonXp(item)} XP`
	}

	if (item.state === 'available') {
		return `Lesson ${getLessonPosition(item)}`
	}

	if (item.state === 'jump') {
		return 'Jump ahead'
	}

	return 'Locked'
}

function getTitle(item: DisplayItem) {
	if (isGuidebookItem(item)) {
		return item.category.title
	}

	if (isRewardItem(item)) {
		return 'Chest'
	}

	return `${getLessonPosition(item)}. ${item.lesson.title}`
}

function getDescription(item: DisplayItem) {
	if (isGuidebookItem(item)) {
		return item.category.description
	}

	if (isRewardItem(item)) {
		return item.chestState === 'opened'
			? 'Reward claimed.'
			: item.chestState === 'ready'
				? 'Open it to collect your bonus.'
				: 'Complete more lessons to unlock it.'
	}

	if (item.state === 'locked') {
		return 'Complete the lesson above to unlock this one.'
	}

	if (item.state === 'jump') {
		return 'Pass this lesson to complete the earlier lessons automatically.'
	}

	return item.lesson.description
}

function PathNodeIcon({ item }: { item: DisplayItem }) {
	if (isGuidebookItem(item)) {
		return <BookOpen className="size-8" />
	}

	if (isRewardItem(item)) {
		return <Gift className="size-8" />
	}

	if (item.state === 'completed') {
		return <Check className="size-9" />
	}

	if (item.state === 'current') {
		return <Star className="size-9 fill-current" />
	}

	if (item.state === 'available') {
		return <Play className="ml-1 size-8 fill-current" />
	}

	if (item.state === 'jump') {
		return <FastForward className="ml-1 size-8 fill-current" />
	}

	return <Lock className="size-8" />
}

function getCalloutLabel(item: DisplayItem) {
	if (!isLessonItem(item)) {
		return undefined
	}

	if (item.state === 'current') {
		return 'Start'
	}

	if (item.state === 'jump') {
		return 'Jump here?'
	}

	return undefined
}

function PathCallout({
	item,
	tone,
	animated = false,
}: {
	item: DisplayItem
	tone: LearnPathTone
	animated?: boolean
}) {
	const label = getCalloutLabel(item)

	if (!label || !isLessonItem(item)) {
		return null
	}

	return (
		<div
			className={cn(
				'pointer-events-none absolute inset-x-0 top-0 z-10 flex -translate-y-[calc(100%-3.55rem)] justify-center',
				animated && '[animation:tagalingo-path-bob_2.8s_ease-in-out_infinite]'
			)}
		>
			<span
				className={cn(
					'relative whitespace-nowrap rounded-lg border-2 px-3 py-1.5 text-[0.74rem] font-black uppercase tracking-[0.08em] shadow-[0_8px_18px_rgba(8,19,28,0.2)]',
					tone.calloutSurface,
					tone.calloutText
				)}
			>
				{label}
				<span
					className={cn(
						'absolute left-1/2 top-full size-3 -translate-x-1/2 -translate-y-[0.42rem] rotate-45 border-b-2 border-r-2',
						tone.calloutSurface
					)}
					aria-hidden="true"
				/>
			</span>
		</div>
	)
}

function PathNode({
	item,
	className,
	onOpenPathChest,
	onOpenLessonActions,
	tone,
}: {
	item: DisplayItem
	className?: string
	onOpenPathChest?: (chestId: string) => void
	onOpenLessonActions?: (lessonId: string) => void
	tone: LearnPathTone
}) {
	const palette = getNodePalette(item, tone)
	const isPlayableLesson = isLessonItem(item) && item.state !== 'locked'
	const isReadyChest = isRewardItem(item) && item.chestState === 'ready'
	const baseClasses = cn(
		'group flex size-24 items-center justify-center rounded-full border-[5px] transition duration-200',
		isPlayableLesson &&
			'hover:-translate-y-1 hover:scale-[1.07] hover:brightness-110 hover:shadow-[0_16px_28px_rgba(8,19,28,0.34)]',
		isReadyChest &&
			'hover:-translate-y-1 hover:scale-[1.07] hover:brightness-110 hover:shadow-[0_16px_28px_rgba(8,19,28,0.34)]',
		palette,
		className
	)

	if (isRewardItem(item)) {
		return (
			<button
				type="button"
				className={cn(
					baseClasses,
					item.chestState !== 'ready' && 'cursor-default'
				)}
				aria-label="Open reward chest"
				onClick={() => {
					if (item.chestState === 'ready') {
						onOpenPathChest?.(item.id)
					}
				}}
			>
				<PathNodeIcon item={item} />
			</button>
		)
	}

	if (isGuidebookItem(item)) {
		return (
			<div className={baseClasses} aria-hidden="true">
				<PathNodeIcon item={item} />
			</div>
		)
	}

	if (item.state === 'locked') {
		return (
			<div className={baseClasses} aria-hidden="true">
				<PathNodeIcon item={item} />
			</div>
		)
	}

	return (
		<button
			type="button"
			className={baseClasses}
			aria-label={`Open ${item.ctaLabel.toLowerCase()} options for ${item.lesson.title}`}
			onClick={() => onOpenLessonActions?.(item.lesson.id)}
		>
			<PathNodeIcon item={item} />
		</button>
	)
}

function getPrimaryActionLabel(item: LessonItem) {
	if (item.state === 'completed') {
		return 'Practice +5 XP'
	}

	if (item.state === 'jump') {
		return `Jump here +${getLessonXp(item)} XP`
	}

	return `${item.ctaLabel} +${getLessonXp(item)} XP`
}

function LessonActionPopup({
	item,
	tone,
	className,
	panelRef,
}: {
	item: LessonItem
	tone: LearnPathTone
	className?: string
	panelRef?: React.RefObject<HTMLDivElement | null>
}) {
	return (
		<div
			ref={panelRef}
			className={cn(
				'z-40 w-[18.5rem] scroll-mb-12 scroll-mt-12',
				className
			)}
		>
			<div
				className={cn(
					'rounded-2xl border-2 p-4 text-white shadow-[0_20px_42px_rgba(8,19,28,0.35)] motion-safe:[animation:tagalingo-lesson-popup-in_180ms_cubic-bezier(0.2,0.8,0.2,1)_both]',
					tone.completedNode
				)}
			>
				<p className="text-base font-black leading-6">{item.lesson.title}</p>
				<p className="mt-1 text-sm font-semibold leading-6 text-white/88">
					Prove your proficiency with this lesson
				</p>
				<Link
					to={`/lesson/${item.lesson.id}`}
					className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-white px-4 text-sm font-black uppercase tracking-[0.04em] text-[#2b8d10] shadow-[inset_0_-4px_0_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[inset_0_-4px_0_rgba(15,23,42,0.12),0_12px_20px_rgba(8,19,28,0.18)]"
				>
					{getPrimaryActionLabel(item)}
				</Link>
				<button
					type="button"
					className="mt-3 flex h-12 w-full cursor-not-allowed items-center justify-center rounded-2xl bg-yellow-300/70 px-4 text-sm font-black uppercase tracking-[0.04em] text-yellow-900 opacity-75 shadow-[inset_0_-4px_0_rgba(133,77,14,0.18)]"
					disabled
				>
					Legendary coming soon
				</button>
			</div>
		</div>
	)
}

function PathLabel({
	item,
	className,
}: {
	item: DisplayItem
	className?: string
}) {
	const isLesson = isLessonItem(item)
	const isCurrentLesson = isLesson && item.state === 'current'
	const isCompletedLesson = isLesson && item.state === 'completed'
	const isJumpLesson = isLesson && item.state === 'jump'
	const isReadyReward = isRewardItem(item) && item.chestState === 'ready'

	return (
		<div className={cn('max-w-[220px] text-left', className)}>
			<p
				className={cn(
					'text-sm font-semibold',
					isCompletedLesson
						? 'text-lime-400'
						: isCurrentLesson
							? 'text-white'
							: isJumpLesson
								? 'text-white/82'
								: 'text-white/68'
				)}
			>
				{getTitle(item)}
			</p>
			<p
				className={cn(
					'mt-1 text-[0.95rem] leading-6',
					isCurrentLesson || isJumpLesson ? 'text-white/82' : 'text-white/56'
				)}
			>
				{getDescription(item)}
			</p>
			<p
				className={cn(
					'mt-1.5 text-sm font-medium',
					isCompletedLesson
						? 'text-lime-400'
						: isCurrentLesson
							? 'text-sky-300'
							: isJumpLesson
								? 'text-amber-300'
							: isReadyReward
								? 'text-amber-300'
								: 'text-white/46'
				)}
			>
				{getStatusLabel(item)}
			</p>
		</div>
	)
}

export function LearnPathCanvas({
	unitView,
	activeLessonId,
	onOpenPathChest,
	className,
	tone,
	reducedMotion = false,
}: {
	unitView: LearnUnitViewModel
	activeLessonId?: string
	onOpenPathChest?: (chestId: string) => void
	className?: string
	tone: LearnPathTone
	reducedMotion?: boolean
}) {
	const items = getDisplayItems(unitView, activeLessonId)
	const [activeActionLessonId, setActiveActionLessonId] = useState<
		string | null
	>(null)
	const actionPopupRef = useRef<HTMLDivElement | null>(null)
	const lastIndex = items.length - 1
	const desktopHeight = topPadding * 2 + lastIndex * rowGap
	const activeActionItem = items.find(
		(item): item is LessonItem =>
			isLessonItem(item) && item.lesson.id === activeActionLessonId
	)
	const shouldAnimateCallout = (item: DisplayItem) =>
		Boolean(getCalloutLabel(item)) && !reducedMotion

	useEffect(() => {
		if (!activeActionLessonId) {
			return
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target

			if (
				target instanceof Node &&
				actionPopupRef.current?.contains(target)
			) {
				return
			}

			setActiveActionLessonId(null)
		}

		document.addEventListener('pointerdown', handlePointerDown)

		return () => document.removeEventListener('pointerdown', handlePointerDown)
	}, [activeActionLessonId])

	useEffect(() => {
		if (!activeActionLessonId) {
			return
		}

		const frame = window.requestAnimationFrame(() => {
			actionPopupRef.current?.scrollIntoView({
				behavior: reducedMotion ? 'auto' : 'smooth',
				block: 'nearest',
				inline: 'nearest',
			})
		})

		return () => window.cancelAnimationFrame(frame)
	}, [activeActionLessonId, reducedMotion])

	return (
		<section className={cn('mx-auto w-full max-w-[840px]', className)}>
			<div className="pt-8 md:hidden">
				<div className="relative ml-4 space-y-10 border-l border-white/10 pl-9">
					{items.map((item, index) => {
						const shift = mobileOffsets[index % mobileOffsets.length]
						return (
							<div
								key={item.id}
								className={cn(
									'relative',
									activeActionItem?.lesson.id === item.id && 'z-40'
								)}
								style={{ transform: `translateX(${shift}px)` }}
							>
								<div className="absolute -left-[3.1rem] top-1 size-[4.5rem]">
									{activeActionItem?.lesson.id !== item.id ? (
										<PathCallout
											item={item}
											tone={tone}
											animated={shouldAnimateCallout(item)}
										/>
									) : null}
									<PathNode
										item={item}
										className="size-[4.5rem]"
										onOpenPathChest={onOpenPathChest}
										onOpenLessonActions={(lessonId) =>
											setActiveActionLessonId((current) =>
												current === lessonId ? null : lessonId
											)
										}
										tone={tone}
									/>
								</div>
								<PathLabel item={item} />
								{activeActionItem?.lesson.id === item.id ? (
									<LessonActionPopup
										item={activeActionItem}
										tone={tone}
										panelRef={actionPopupRef}
										className="mt-4"
									/>
								) : null}
							</div>
						)
					})}
				</div>
			</div>

			<div className="hidden pt-2 md:block">
				<div
					className="relative mx-auto"
					style={{ height: `${desktopHeight}px`, width: `${desktopWidth}px` }}
				>
					<svg
						className="pointer-events-none absolute inset-0"
						width={desktopWidth}
						height={desktopHeight}
						viewBox={`0 0 ${desktopWidth} ${desktopHeight}`}
						fill="none"
						aria-hidden="true"
					>
						{items.slice(0, -1).map((_, index) => {
							const x1 =
								desktopCenterX + desktopOffsets[index % desktopOffsets.length]
							const y1 = topPadding + index * rowGap
							const x2 =
								desktopCenterX +
								desktopOffsets[(index + 1) % desktopOffsets.length]
							const y2 = topPadding + (index + 1) * rowGap

							return (
								<path
									key={`path-${items[index]?.id ?? index}`}
									d={`M ${x1} ${y1} C ${x1} ${y1 + 48}, ${x2} ${y2 - 48}, ${x2} ${y2}`}
									stroke={index === 0 ? tone.pathFirst : tone.path}
									strokeWidth="8"
									strokeLinecap="round"
									opacity="0.95"
								/>
							)
						})}
					</svg>

					{items.map((item, index) => {
						const x =
							desktopCenterX + desktopOffsets[index % desktopOffsets.length]
						const y = topPadding + index * rowGap
						const labelOnLeft = x > 300

						return (
							<div
								key={item.id}
								className={cn(
									'absolute size-24',
									activeActionItem?.lesson.id === item.id && 'z-40'
								)}
								style={{
									left: `${x}px`,
									top: `${y}px`,
									transform: 'translate(-50%, -50%)',
								}}
							>
								{activeActionItem?.lesson.id !== item.id ? (
									<PathCallout
										item={item}
										tone={tone}
										animated={shouldAnimateCallout(item)}
									/>
								) : null}
								<PathNode
									item={item}
									onOpenPathChest={onOpenPathChest}
									onOpenLessonActions={(lessonId) =>
										setActiveActionLessonId((current) =>
											current === lessonId ? null : lessonId
										)
									}
									tone={tone}
								/>
								{activeActionItem?.lesson.id === item.id ? (
									<LessonActionPopup
										item={activeActionItem}
										tone={tone}
										panelRef={actionPopupRef}
										className="absolute left-1/2 top-[calc(100%+0.9rem)] -translate-x-1/2"
									/>
								) : null}

								<div
									className={cn(
										'sr-only absolute top-1/2 w-[230px] -translate-y-1/2',
										labelOnLeft
											? 'right-[7.25rem] text-right'
											: 'left-[7.25rem]'
									)}
								>
									<PathLabel
										item={item}
										className={labelOnLeft ? 'ml-auto text-right' : undefined}
									/>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
