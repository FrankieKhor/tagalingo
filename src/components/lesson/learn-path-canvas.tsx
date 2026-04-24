import { BookOpen, Check, Gift, Lock, Play, Star } from 'lucide-react'
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

	return <Lock className="size-8" />
}

function PathNode({
	item,
	className,
	onOpenPathChest,
	tone,
}: {
	item: DisplayItem
	className?: string
	onOpenPathChest?: (chestId: string) => void
	tone: LearnPathTone
}) {
	const palette = getNodePalette(item, tone)
	const isPlayableLesson = isLessonItem(item) && item.state !== 'locked'
	const isReadyChest = isRewardItem(item) && item.chestState === 'ready'
	const baseClasses = cn(
		'group flex size-24 items-center justify-center rounded-full border-[5px] transition duration-200',
		isPlayableLesson && 'hover:scale-[1.02]',
		isReadyChest && 'hover:scale-[1.02]',
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
		<Link
			to={`/lesson/${item.lesson.id}`}
			className={baseClasses}
			aria-label={`${item.ctaLabel} ${item.lesson.title}`}
		>
			<PathNodeIcon item={item} />
		</Link>
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
							: 'text-white/68'
				)}
			>
				{getTitle(item)}
			</p>
			<p
				className={cn(
					'mt-1 text-[0.95rem] leading-6',
					isCurrentLesson ? 'text-white/82' : 'text-white/56'
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
}: {
	unitView: LearnUnitViewModel
	activeLessonId?: string
	onOpenPathChest?: (chestId: string) => void
	className?: string
	tone: LearnPathTone
}) {
	const items = getDisplayItems(unitView, activeLessonId)
	const lastIndex = items.length - 1
	const desktopHeight = topPadding * 2 + lastIndex * rowGap

	return (
		<section className={cn('mx-auto w-full max-w-[840px]', className)}>
			<div className="pt-8 md:hidden">
				<div className="relative ml-4 space-y-10 border-l border-white/10 pl-9">
					{items.map((item, index) => {
						const shift = mobileOffsets[index % mobileOffsets.length]
						return (
							<div
								key={item.id}
								className="relative"
								style={{ transform: `translateX(${shift}px)` }}
							>
								<div className="absolute -left-[3.1rem] top-1">
									<PathNode
										item={item}
										className="size-[4.5rem]"
										onOpenPathChest={onOpenPathChest}
										tone={tone}
									/>
								</div>
								<PathLabel item={item} />
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
								className="absolute"
								style={{
									left: `${x}px`,
									top: `${y}px`,
									transform: 'translate(-50%, -50%)',
								}}
							>
								<PathNode
									item={item}
									onOpenPathChest={onOpenPathChest}
									tone={tone}
								/>

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
