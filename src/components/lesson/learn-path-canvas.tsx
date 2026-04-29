import {
	Bird,
	BookOpen,
	Check,
	FastForward,
	Lock,
	Play,
	Star,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import {
	ChestIcon,
	InactiveChestIcon,
	OpenChestIcon,
} from '@/components/rewards/chest-icon'
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
type LessonNodeIcon = 'check' | 'book' | 'chicken'
type PathNodeIconMeta = {
	lessonIcon?: LessonNodeIcon
}
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
const mobileOffsets = [0, 10, -6, 8, -8, 4]
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

function getRewardIconTone(item: RewardItem) {
	if (item.chestState === 'opened') {
		return 'text-lime-400'
	}

	if (item.chestState === 'ready') {
		return 'text-amber-300'
	}

	return 'text-white/45'
}

function getLessonNodeSurface(item: LessonItem) {
	if (item.state === 'locked') {
		return [
			'border-white/10 bg-[linear-gradient(180deg,#334453_0%,#24313d_58%,#1b2630_100%)] text-white/48',
			'shadow-[inset_0_4px_0_rgba(255,255,255,0.08),inset_0_-7px_0_rgba(8,19,28,0.28),0_12px_0_rgba(8,19,28,0.2),0_18px_24px_rgba(8,19,28,0.22)]',
		]
	}

	if (item.state === 'jump') {
		return [
			'border-sky-200/35 bg-[linear-gradient(180deg,#5bd8ff_0%,#1facf0_48%,#0b82c8_100%)] text-white',
			'shadow-[inset_0_5px_0_rgba(255,255,255,0.28),inset_0_-8px_0_rgba(3,105,161,0.42),0_10px_0_rgba(3,105,161,0.85),0_18px_28px_rgba(8,19,28,0.28)]',
		]
	}

	if (item.state === 'current') {
		return [
			'border-sky-100/70 bg-[linear-gradient(180deg,#67e8f9_0%,#22c7f7_45%,#0ea5e9_100%)] text-white',
			'shadow-[inset_0_5px_0_rgba(255,255,255,0.38),inset_0_-8px_0_rgba(2,132,199,0.48),0_10px_0_rgba(3,105,161,0.95),0_20px_32px_rgba(8,19,28,0.34)]',
		]
	}

	if (item.state === 'completed') {
		return [
			'border-sky-100/70 bg-[linear-gradient(180deg,#55d7ff_0%,#18b9f2_46%,#0284c7_100%)] text-white',
			'shadow-[inset_0_5px_0_rgba(255,255,255,0.36),inset_0_-8px_0_rgba(2,132,199,0.5),0_10px_0_rgba(3,105,161,0.95),0_18px_28px_rgba(8,19,28,0.3)]',
		]
	}

	return [
		'border-sky-100/50 bg-[linear-gradient(180deg,#7dd3fc_0%,#38bdf8_48%,#0ea5e9_100%)] text-white',
		'shadow-[inset_0_5px_0_rgba(255,255,255,0.32),inset_0_-8px_0_rgba(2,132,199,0.42),0_10px_0_rgba(3,105,161,0.82),0_18px_28px_rgba(8,19,28,0.28)]',
	]
}

function getGuidebookNodeSurface() {
	return [
		'border-sky-100/55 bg-[linear-gradient(180deg,#5bd8ff_0%,#1fbaf2_48%,#0b88cf_100%)] text-white',
		'shadow-[inset_0_5px_0_rgba(255,255,255,0.3),inset_0_-8px_0_rgba(2,132,199,0.44),0_10px_0_rgba(3,105,161,0.82),0_18px_28px_rgba(8,19,28,0.28)]',
	]
}

function getPathNodeIconMeta(items: DisplayItem[]) {
	const meta = new Map<string, PathNodeIconMeta>()
	const lessonItems = items.filter((item): item is LessonItem =>
		isLessonItem(item)
	)

	lessonItems.forEach((item) => {
		const lastSectionLesson =
			item.category.lessons[item.category.lessons.length - 1]
		const lessonIndex = item.category.lessons.findIndex(
			(lesson) => lesson.id === item.lesson.id
		)

		meta.set(item.id, {
			lessonIcon: item.state === 'completed' && item.lesson.id === lastSectionLesson?.id
				? 'chicken'
				: lessonIndex % 2 === 0
					? 'check'
					: 'book',
		})
	})

	return meta
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

function PathNodeIcon({
	item,
	iconMeta,
}: {
	item: DisplayItem
	iconMeta?: PathNodeIconMeta
}) {
	if (isGuidebookItem(item)) {
		return <BookOpen className="size-9 drop-shadow-[0_3px_0_rgba(8,19,28,0.18)]" />
	}

	if (isRewardItem(item)) {
		if (item.chestState === 'opened') {
			return (
				<OpenChestIcon className="size-16 drop-shadow-[0_12px_18px_rgba(8,19,28,0.34)] md:size-20" />
			)
		}

		if (item.chestState === 'locked') {
			return (
				<InactiveChestIcon
					className="size-16 opacity-62 drop-shadow-[0_10px_16px_rgba(8,19,28,0.22)] md:size-20"
				/>
			)
		}

		return (
			<ChestIcon className="size-16 drop-shadow-[0_12px_18px_rgba(8,19,28,0.34)] md:size-20" />
		)
	}

	if (item.state === 'completed') {
		if (iconMeta?.lessonIcon === 'chicken') {
			return (
				<Bird className="size-10 fill-white/20 drop-shadow-[0_3px_0_rgba(8,19,28,0.18)]" />
			)
		}

		if (iconMeta?.lessonIcon === 'book') {
			return (
				<BookOpen className="size-10 drop-shadow-[0_3px_0_rgba(8,19,28,0.18)]" />
			)
		}

		return (
			<Check className="size-11 stroke-[4] drop-shadow-[0_3px_0_rgba(8,19,28,0.18)]" />
		)
	}

	if (item.state === 'locked') {
		if (iconMeta?.lessonIcon === 'chicken') {
			return (
				<Bird className="size-9 fill-white/10 drop-shadow-[0_3px_0_rgba(8,19,28,0.14)]" />
			)
		}

		if (iconMeta?.lessonIcon === 'book') {
			return <BookOpen className="size-9 drop-shadow-[0_3px_0_rgba(8,19,28,0.14)]" />
		}

		return <Check className="size-10 stroke-[4] drop-shadow-[0_3px_0_rgba(8,19,28,0.14)]" />
	}

	if (item.state === 'current') {
		return (
			<Star className="size-11 fill-current drop-shadow-[0_3px_0_rgba(8,19,28,0.18)]" />
		)
	}

	if (item.state === 'available') {
		return (
			<Play className="ml-1 size-10 fill-current drop-shadow-[0_3px_0_rgba(8,19,28,0.18)]" />
		)
	}

	if (item.state === 'jump') {
		return (
			<FastForward className="ml-1 size-10 fill-current drop-shadow-[0_3px_0_rgba(8,19,28,0.18)]" />
		)
	}

	return <Lock className="size-9 drop-shadow-[0_3px_0_rgba(8,19,28,0.14)]" />
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
	iconMeta,
}: {
	item: DisplayItem
	className?: string
	onOpenPathChest?: (chestId: string) => void
	onOpenLessonActions?: (lessonId: string) => void
	tone: LearnPathTone
	iconMeta?: PathNodeIconMeta
}) {
	const palette = getNodePalette(item, tone)
	const isPlayableLesson = isLessonItem(item) && item.state !== 'locked'
	const isReadyChest = isRewardItem(item) && item.chestState === 'ready'
	const baseClasses = cn(
		'group relative flex size-24 items-center justify-center transition duration-200',
		!isRewardItem(item) &&
			'rounded-full border-[5px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#102129]',
		isPlayableLesson &&
			'hover:-translate-y-1 hover:scale-[1.07] hover:brightness-110 active:translate-y-1 active:scale-[1.03]',
		isReadyChest &&
			'hover:-translate-y-1 hover:scale-[1.08] hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#102129]',
		isRewardItem(item)
			? getRewardIconTone(item)
			: isLessonItem(item)
				? getLessonNodeSurface(item)
				: isGuidebookItem(item)
					? getGuidebookNodeSurface()
					: palette,
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
				aria-label={
					item.chestState === 'opened'
						? 'Reward chest opened'
						: item.chestState === 'ready'
							? 'Open reward chest'
							: 'Reward chest locked'
				}
				onClick={() => {
					if (item.chestState === 'ready') {
						onOpenPathChest?.(item.id)
					}
				}}
			>
				<PathNodeIcon item={item} iconMeta={iconMeta} />
			</button>
		)
	}

	if (isGuidebookItem(item)) {
		return (
			<div className={baseClasses} aria-hidden="true">
				<PathNodeIcon item={item} iconMeta={iconMeta} />
			</div>
		)
	}

	if (item.state === 'locked') {
		return (
			<div className={baseClasses} aria-hidden="true">
				<PathNodeIcon item={item} iconMeta={iconMeta} />
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
			<PathNodeIcon item={item} iconMeta={iconMeta} />
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
				'z-40 w-[min(18.5rem,calc(100vw-5rem))] scroll-mb-12 scroll-mt-12',
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
		<div className={cn('max-w-full text-left sm:max-w-[220px]', className)}>
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
	const iconMetaByItemId = getPathNodeIconMeta(items)
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

			if (target instanceof Node && actionPopupRef.current?.contains(target)) {
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
			<div className="pt-7 md:hidden">
				<div className="relative ml-3 space-y-9 border-l border-white/10 pl-9">
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
										iconMeta={iconMetaByItemId.get(item.id)}
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
									iconMeta={iconMetaByItemId.get(item.id)}
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
