import {
	ArrowLeft,
	Bird,
	BookOpen,
	Coins,
	Flame,
	Gift,
	Heart,
	Sparkles,
	Star,
	Target,
	Volume2,
} from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import {
	LearnPathCanvas,
	type LearnPathTone,
} from '@/components/lesson/learn-path-canvas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import type {
	ChestReward,
	LearnUnitViewModel,
	Quest,
} from '@/lib/domain/models'
import { getDailyChestState } from '@/lib/domain/progress'
import { getQuestCounts } from '@/lib/domain/quests'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'

type SectionTone = LearnPathTone & {
	header: string
	headerButton: string
	headerButtonBorder: string
}

const sectionTones: SectionTone[] = [
	{
		header:
			'bg-orange-400 shadow-[inset_0_-3px_0_rgba(154,86,0,0.28),0_12px_28px_rgba(8,19,28,0.24)]',
		// headerButton: 'bg-orange-300/20 hover:bg-white/12',
		headerButton: 'bg-[#091520]  bg-orange-300/20 hover:bg-white/12',
		headerButtonBorder: 'border-orange-500/45',
		availableNode: 'border-orange-300/20 bg-orange-500 text-white',
		completedNode:
			'border-orange-200/30 bg-orange-400 text-white shadow-[0_0_0_6px_rgba(251,146,60,0.16)]',
		currentNode:
			'border-orange-200/35 bg-orange-500 text-white shadow-[0_0_0_8px_rgba(251,146,60,0.2)]',
		guidebookNode: 'border-orange-300/25 bg-[#172b34] text-orange-100',
		calloutText: 'text-orange-500 dark:text-orange-300',
		calloutSurface:
			'border-orange-400/45 bg-white text-orange-500 dark:border-orange-300/35 dark:bg-[#091520] dark:text-orange-300',
		path: '#5f6976',
		pathFirst: '#7c8793',
	},
	{
		header:
			'bg-rose-500 shadow-[inset_0_-3px_0_rgba(136,19,55,0.3),0_12px_28px_rgba(8,19,28,0.24)]',
		headerButton: 'bg-rose-300/18 hover:bg-white/12',
		headerButtonBorder: 'border-rose-700/35',
		availableNode: 'border-rose-300/20 bg-rose-500 text-white',
		completedNode:
			'border-rose-200/30 bg-rose-500 text-white shadow-[0_0_0_6px_rgba(244,63,94,0.16)]',
		currentNode:
			'border-rose-200/35 bg-rose-500 text-white shadow-[0_0_0_8px_rgba(244,63,94,0.2)]',
		guidebookNode: 'border-rose-300/25 bg-[#1f2732] text-rose-100',
		calloutText: 'text-rose-500 dark:text-rose-300',
		calloutSurface:
			'border-rose-400/45 bg-white text-rose-500 dark:border-rose-300/35 dark:bg-[#091520] dark:text-rose-300',
		path: '#646f7c',
		pathFirst: '#87919d',
	},
	{
		header:
			'bg-sky-500 shadow-[inset_0_-3px_0_rgba(12,74,110,0.3),0_12px_28px_rgba(8,19,28,0.24)]',
		headerButton: 'bg-sky-300/18 hover:bg-white/12',
		headerButtonBorder: 'border-sky-700/35',
		availableNode: 'border-sky-300/20 bg-sky-500 text-white',
		completedNode:
			'border-sky-200/30 bg-sky-500 text-white shadow-[0_0_0_6px_rgba(14,165,233,0.16)]',
		currentNode:
			'border-sky-200/35 bg-sky-500 text-white shadow-[0_0_0_8px_rgba(14,165,233,0.2)]',
		guidebookNode: 'border-sky-300/25 bg-[#132435] text-sky-100',
		calloutText: 'text-sky-500 dark:text-sky-300',
		calloutSurface:
			'border-sky-400/45 bg-white text-sky-500 dark:border-sky-300/35 dark:bg-[#091520] dark:text-sky-300',
		path: '#5b6c7a',
		pathFirst: '#7f93a4',
	},
	{
		header:
			'bg-emerald-500 shadow-[inset_0_-3px_0_rgba(6,95,70,0.3),0_12px_28px_rgba(8,19,28,0.24)]',
		headerButton: 'bg-emerald-300/18 hover:bg-white/12',
		headerButtonBorder: 'border-emerald-700/35',
		availableNode: 'border-emerald-300/20 bg-emerald-500 text-white',
		completedNode:
			'border-emerald-200/30 bg-emerald-500 text-white shadow-[0_0_0_6px_rgba(16,185,129,0.16)]',
		currentNode:
			'border-emerald-200/35 bg-emerald-500 text-white shadow-[0_0_0_8px_rgba(16,185,129,0.2)]',
		guidebookNode: 'border-emerald-300/25 bg-[#142b2c] text-emerald-100',
		calloutText: 'text-emerald-500 dark:text-emerald-300',
		calloutSurface:
			'border-emerald-400/45 bg-white text-emerald-500 dark:border-emerald-300/35 dark:bg-[#091520] dark:text-emerald-300',
		path: '#596f70',
		pathFirst: '#7f9694',
	},
]

function getSectionTone(order: number) {
	return sectionTones[(order - 1) % sectionTones.length]
}

function SectionPathHeader({
	unitView,
	tone,
}: {
	unitView: LearnUnitViewModel
	tone: SectionTone
}) {
	const [isGuidebookOpen, setIsGuidebookOpen] = useState(false)
	const guidebookHighlights =
		unitView.unit.guidebookHighlights ??
		unitView.unit.categories
			.filter((category) => category.hasGuidebook)
			.flatMap((category) =>
				category.lessons.flatMap((lesson) =>
					lesson.introCards.map((card) => `${card.tagalog}: ${card.meaning}`)
				)
			)
			.slice(0, 3)
	const guidebookPhrases = guidebookHighlights.map((highlight) => {
		const [phrase, ...translationParts] = highlight.split(':')

		return {
			phrase: phrase.trim(),
			translation: translationParts.join(':').trim(),
		}
	})

	return (
		<Dialog open={isGuidebookOpen} onOpenChange={setIsGuidebookOpen}>
			<div
				className={cn(
					'sticky top-[4.25rem] z-30 mx-auto w-full max-w-[592px] rounded-2xl px-3 py-3 text-white sm:px-5 sm:py-4 lg:top-20',
					tone.header
				)}
			>
				<div className="flex items-center justify-between gap-3">
					<div className="min-w-0">
						<div className="flex items-center gap-2 text-xs font-black uppercase">
							<ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
							<span>Section {unitView.unit.order}</span>
						</div>
						<h2 className="mt-1.5 truncate text-base font-black tracking-tight sm:mt-2 sm:text-xl">
							{unitView.unit.bannerTitle}
						</h2>
					</div>
					{guidebookHighlights.length > 0 ? (
						<button
							type="button"
							className={cn(
								'flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 shadow-[inset_0_-3px_0_rgba(8,19,28,0.16)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
								tone.headerButton,
								tone.headerButtonBorder
							)}
							aria-label={`Open Unit ${unitView.unit.order} guidebook`}
							aria-haspopup="dialog"
							onClick={() => setIsGuidebookOpen(true)}
							title="Guidebook"
						>
							<BookOpen className="size-5" aria-hidden="true" />
						</button>
					) : null}
				</div>
			</div>
			{guidebookHighlights.length > 0 ? (
				<DialogContent className="max-h-[min(760px,calc(100vh-2rem))] max-w-2xl overflow-y-auto border border-[#354955] bg-[#102027] px-5 py-7 text-white shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:px-8 sm:py-8">
					<DialogHeader className="mb-7 border-b border-[#354955] pb-7 pr-8">
						<div className="flex items-center gap-5">
							<div className="relative flex size-24 shrink-0 items-center justify-center sm:size-28">
								<div className="absolute bottom-1 size-20 rounded-full bg-black/30 sm:size-24" />
								<div className="relative flex size-20 items-center justify-center rounded-[1.6rem] bg-lime-500 text-white shadow-[inset_0_-6px_0_rgba(20,83,45,0.28)] sm:size-24">
									<Bird
										className="size-14 fill-white/15 text-white sm:size-16"
										aria-hidden="true"
									/>
									<div className="absolute left-5 top-6 size-6 rounded-full bg-white sm:left-6 sm:top-7 sm:size-7">
										<div className="ml-3 mt-1 size-3 rounded-full bg-slate-700 sm:size-3.5" />
									</div>
									<div className="absolute right-4 top-4 size-5 rounded-full bg-white sm:right-5 sm:top-5 sm:size-6">
										<div className="ml-2.5 mt-1 size-2.5 rounded-full bg-slate-700 sm:size-3" />
									</div>
								</div>
							</div>
							<div className="min-w-0">
								<DialogTitle className="text-2xl font-black leading-tight text-white sm:text-3xl">
									Unit {unitView.unit.order} Guidebook
								</DialogTitle>
								<DialogDescription className="mt-2 text-base font-bold leading-snug text-white/85 sm:text-lg">
									Explore grammar tips and key phrases for this unit
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>
					<div className="max-w-[440px] space-y-4">
						<p className="text-sm font-black uppercase text-sky-300">
							Key phrases
						</p>
						<div className="space-y-5">
							{guidebookPhrases.map(({ phrase, translation }) => (
								<div
									key={`${phrase}-${translation}`}
									className="relative w-fit max-w-full rounded-2xl border-2 border-[#354955] bg-[#102027] px-4 py-4 pl-14 shadow-[inset_0_-2px_0_rgba(255,255,255,0.02)] before:absolute before:left-[-10px] before:top-6 before:size-5 before:rotate-45 before:border-b-2 before:border-l-2 before:border-[#354955] before:bg-[#102027]"
								>
									<Volume2
										className="absolute left-4 top-4 size-7 fill-sky-400 text-sky-400"
										aria-hidden="true"
									/>
									<p className="w-fit max-w-full border-b-2 border-dotted border-white/45 pr-1 text-base font-black leading-snug text-white">
										{phrase}
									</p>
									{translation ? (
										<p className="mt-2 text-base font-bold leading-snug text-slate-500">
											{translation}
										</p>
									) : null}
								</div>
							))}
						</div>
					</div>
				</DialogContent>
			) : null}
		</Dialog>
	)
}

function CircularGoal({
	value,
	current,
	target,
}: {
	value: number
	current: number
	target: number
}) {
	const progressDegrees = Math.max(0, Math.min(360, value * 3.6))

	return (
		<div
			className="relative flex size-[110px] items-center justify-center rounded-full"
			style={{
				background: `conic-gradient(#84cc16 0deg ${progressDegrees}deg, rgba(148,163,184,0.28) ${progressDegrees}deg 360deg)`,
			}}
		>
			<div className="flex size-[82px] flex-col items-center justify-center rounded-full bg-white text-slate-950 shadow-inner dark:bg-[#15212d] dark:text-white">
				<p className="text-[2rem] font-black leading-none">{current}</p>
				<p className="mt-1 text-sm text-slate-500 dark:text-white/62">
					/{target} XP
				</p>
			</div>
		</div>
	)
}

function SummaryCell({
	className,
	children,
}: {
	className?: string
	children: ReactNode
}) {
	return (
		<div className={cn('px-4 py-5 sm:px-7 sm:py-6', className)}>{children}</div>
	)
}

function QuestIcon({ quest }: { quest: Quest }) {
	if (quest.metric.includes('reviews')) {
		return <Sparkles className="size-5" />
	}

	if (quest.metric.includes('xp') || quest.metric.includes('score')) {
		return <Target className="size-5" />
	}

	if (quest.metric.includes('streak')) {
		return <Volume2 className="size-5" />
	}

	return <BookOpen className="size-5" />
}

function QuestRailRow({
	quest,
	onClaim,
}: {
	quest: Quest
	onClaim: (questId: string) => void | Promise<void>
}) {
	const progressValue = Math.min((quest.progress / quest.target) * 100, 100)

	return (
		<div className="rounded-[22px] bg-slate-50 p-4 dark:bg-white/4">
			<div className="flex items-start gap-3">
				<div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-full bg-lime-400 text-[#12202d]">
					<QuestIcon quest={quest} />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-3">
						<p className="text-sm font-semibold text-slate-900 dark:text-white/92">
							{quest.title}
						</p>
						<p className="shrink-0 text-sm font-semibold text-lime-400">
							+{quest.rewardPoints} XP
						</p>
					</div>
					<div className="mt-3 flex items-center gap-3">
						<Progress
							value={progressValue}
							className="h-2 bg-slate-200 dark:bg-white/8"
						/>
						<span className="text-sm text-slate-500 dark:text-white/58">
							{quest.progress} / {quest.target}
						</span>
					</div>
					{quest.completed && !quest.claimed ? (
						<Button
							type="button"
							size="sm"
							className="mt-3 h-9 rounded-xl bg-lime-400 px-4 text-[#102030] hover:bg-lime-300"
							onClick={() => onClaim(quest.id)}
						>
							Claim
						</Button>
					) : null}
				</div>
			</div>
		</div>
	)
}

function LearnSideRail({
	quests,
	onClaim,
	dailyChestState,
	onOpenDailyChest,
}: {
	quests: ReturnType<typeof getQuestCounts>['activeDaily']
	onClaim: (questId: string) => void | Promise<void>
	dailyChestState: 'locked' | 'ready' | 'opened'
	onOpenDailyChest: () => void | Promise<void>
}) {
	return (
		<Card className="overflow-hidden border-slate-200/80 bg-white/88 shadow-sm dark:border-white/10 dark:bg-[#121e29] dark:shadow-none">
			<div className="space-y-0">
				<div className="flex items-start justify-between gap-4 px-4 py-5 sm:px-6 sm:py-6">
					<div>
						<h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-[2rem]">
							Daily chest
						</h2>
						<p className="mt-2 max-w-[14rem] text-sm leading-6 text-slate-600 dark:text-white/70 sm:mt-3 sm:text-lg sm:leading-8">
							{dailyChestState === 'locked'
								? "Complete a lesson or review to unlock today's reward."
								: dailyChestState === 'ready'
									? 'Open your chest to earn rewards!'
									: "You already opened today's chest. Come back tomorrow."}
						</p>
					</div>
					<div className="flex size-16 shrink-0 items-center justify-center rounded-[22px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_55%),linear-gradient(180deg,#5dafff_0%,#2d68ca_100%)] shadow-[inset_0_2px_0_rgba(255,255,255,0.22)] sm:size-24 sm:rounded-[28px]">
						<Gift className="size-8 text-white sm:size-11" />
					</div>
				</div>
				<div className="px-4 pb-5 sm:px-6 sm:pb-6">
					<Button
						type="button"
						className="h-12 w-full rounded-2xl bg-[#2f7ce7] text-base font-semibold text-white hover:bg-[#4289ec]"
						disabled={dailyChestState !== 'ready'}
						onClick={onOpenDailyChest}
					>
						{dailyChestState === 'opened' ? 'Opened today' : 'Open chest'}
					</Button>
				</div>

				<div className="border-t border-slate-200/80 px-4 py-5 dark:border-white/8">
					<div className="px-2">
						<h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-[1.9rem]">
							Quests
						</h3>
						<p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/70 sm:text-lg sm:leading-8">
							Complete quests to earn XP!
						</p>
						<p className="mt-1 text-sm text-slate-400 dark:text-white/42">
							Refreshes daily
						</p>
					</div>

					<div className="mt-5 space-y-3">
						{quests.slice(0, 3).map((quest) => (
							<QuestRailRow key={quest.id} quest={quest} onClaim={onClaim} />
						))}
					</div>

					<Button
						asChild
						variant="outline"
						className="mt-5 h-12 w-full rounded-2xl border-slate-200 bg-white text-base text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:border-white/12 dark:bg-transparent dark:text-[#57a8ff] dark:hover:bg-white/5 dark:hover:text-[#83c0ff]"
					>
						<Link to="/quests">View all quests</Link>
					</Button>
				</div>
			</div>
		</Card>
	)
}

export function LearnPage() {
	const snapshot = useAppStore((state) => state.snapshot)
	const learnUnits = useAppStore((state) => state.learnUnits)
	const path = useAppStore((state) => state.path)
	const claimQuest = useAppStore((state) => state.claimQuest)
	const openPathChest = useAppStore((state) => state.openPathChest)
	const openDailyChest = useAppStore((state) => state.openDailyChest)
	const [now] = useState(() => Date.now())
	const [chestReward, setChestReward] = useState<ChestReward | null>(null)
	const [activeSectionId, setActiveSectionId] = useState<string | undefined>(
		undefined
	)
	const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

	const dueReview = snapshot.reviewQueue.filter(
		(item) => new Date(item.dueAt).getTime() <= now
	).length
	const goalProgress = Math.min(
		(snapshot.profile.dailyGoal.currentXp /
			snapshot.profile.dailyGoal.xpTarget) *
			100,
		100
	)
	const nextLesson =
		path.find((node) => node.isCurrent) ??
		path.find((node) => node.unlocked && !node.completed)
	const questCounts = getQuestCounts(snapshot.quests)
	const dailyChestState = getDailyChestState(snapshot)
	const activeUnitView = useMemo<LearnUnitViewModel | undefined>(() => {
		const currentUnitId = nextLesson?.unit.id
		return (
			learnUnits.find((unitView) => unitView.unit.id === currentUnitId) ??
			learnUnits[0]
		)
	}, [learnUnits, nextLesson?.unit.id])
	const activeUnitLessons =
		activeUnitView?.unit.categories.flatMap((category) => category.lessons) ??
		[]
	const completedUnitLessons = activeUnitLessons.filter(
		(lesson) => snapshot.lessonProgress[lesson.id]?.status === 'completed'
	).length
	const activeHeaderUnit =
		learnUnits.find((unitView) => unitView.unit.id === activeSectionId) ??
		activeUnitView ??
		learnUnits[0]
	const activeHeaderTone = activeHeaderUnit
		? getSectionTone(activeHeaderUnit.unit.order)
		: sectionTones[0]

	useEffect(() => {
		if (!learnUnits.length) {
			return
		}

		function updateActiveSection() {
			let activeId = learnUnits[0]?.unit.id
			const triggerY = 160

			for (const unitView of learnUnits) {
				const section = sectionRefs.current[unitView.unit.id]

				if (!section) {
					continue
				}

				if (section.getBoundingClientRect().top <= triggerY) {
					activeId = unitView.unit.id
				}
			}

			setActiveSectionId(activeId)
		}

		updateActiveSection()
		window.addEventListener('scroll', updateActiveSection, { passive: true })
		window.addEventListener('resize', updateActiveSection)

		return () => {
			window.removeEventListener('scroll', updateActiveSection)
			window.removeEventListener('resize', updateActiveSection)
		}
	}, [learnUnits])

	const rewardPresentation = chestReward
		? chestReward.rewardType === 'xp'
			? {
					icon: <Star className="size-8" />,
					badge: 'XP reward',
					amountLabel: `+${chestReward.amount} XP`,
					iconTone: 'from-sky-400 to-cyan-500 text-white',
				}
			: chestReward.rewardType === 'points'
				? {
						icon: <Coins className="size-8" />,
						badge: 'Points reward',
						amountLabel: `+${chestReward.amount} Points`,
						iconTone: 'from-amber-300 to-orange-400 text-slate-950',
					}
				: {
						icon: <Heart className="size-8" />,
						badge: 'Heart reward',
						amountLabel: `+${chestReward.amount} Heart${chestReward.amount === 1 ? '' : 's'}`,
						iconTone: 'from-rose-400 to-pink-500 text-white',
					}
		: null

	async function handleOpenPathChest(chestId: string) {
		const reward = await openPathChest(chestId)

		if (reward) {
			setChestReward(reward)
		}
	}

	async function handleOpenDailyChest() {
		const reward = await openDailyChest()

		if (reward) {
			setChestReward(reward)
		}
	}

	return (
		<div className="mx-auto max-w-[1440px] space-y-5 sm:space-y-6">
			<Dialog
				open={Boolean(chestReward)}
				onOpenChange={(open) => !open && setChestReward(null)}
			>
				<DialogContent className="max-w-md rounded-[32px] border-slate-200 bg-white text-slate-950 dark:border-white/10 dark:bg-[#12202c] dark:text-white">
					<DialogHeader className="items-center text-center">
						<div
							className={cn(
								'flex size-20 items-center justify-center rounded-full bg-gradient-to-br shadow-[0_12px_30px_rgba(15,23,42,0.18)]',
								rewardPresentation?.iconTone
							)}
						>
							{rewardPresentation?.icon}
						</div>
						<div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-sky-700 dark:bg-white/8 dark:text-sky-200">
							{chestReward?.source === 'daily'
								? 'Daily chest'
								: 'Treasure chest'}
						</div>
						<DialogTitle className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
							Chest opened
						</DialogTitle>
						<DialogDescription className="max-w-sm text-base leading-7 text-slate-600 dark:text-white/70">
							A little bonus for keeping your Tagalog momentum going.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-5 text-center dark:border-white/10 dark:bg-white/4">
							<p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400 dark:text-white/42">
								{rewardPresentation?.badge}
							</p>
							<p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
								{rewardPresentation?.amountLabel}
							</p>
						</div>
						<Button
							type="button"
							className="h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
							onClick={() => setChestReward(null)}
						>
							Continue
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<div className="flex items-start justify-between gap-4 sm:gap-6">
				<div>
					<h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
						Learn
					</h1>
					<p className="mt-1 text-base text-slate-600 dark:text-white/68 sm:mt-2 sm:text-lg">
						Your path to Tagalog fluency
					</p>
				</div>
				<div className="hidden items-center gap-2 rounded-full border border-orange-200/80 bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-white/8 dark:bg-white/4 dark:text-white/65 lg:flex">
					<Flame className="size-4 text-orange-300" />
					{snapshot.profile.streak} day streak and counting
				</div>
			</div>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
				<div className="space-y-6">
					<Card className="overflow-hidden border-slate-200/80 bg-white/88 shadow-sm dark:border-white/10 dark:bg-[#121d28] dark:shadow-none">
						<div className="grid divide-y divide-slate-200/80 dark:divide-white/8 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4">
							<SummaryCell className="flex items-center gap-4 sm:gap-5">
								<CircularGoal
									value={goalProgress}
									current={snapshot.profile.dailyGoal.currentXp}
									target={snapshot.profile.dailyGoal.xpTarget}
								/>
								<div>
									<p className="text-sm font-medium text-slate-500 dark:text-white/56">
										Daily XP
									</p>
									<p className="mt-2 text-xl font-black text-slate-950 dark:text-white sm:mt-3 sm:text-2xl">
										You're on track!
									</p>
									<p className="mt-1 max-w-[12rem] text-sm leading-6 text-slate-600 dark:text-white/68 sm:text-lg sm:leading-7">
										Keep it up to reach your goal.
									</p>
								</div>
							</SummaryCell>

							<SummaryCell>
								<div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-white/56">
									<span>Next lesson</span>
									<span className="size-3 rounded-full bg-lime-400" />
								</div>
								<p className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:mt-3 sm:text-[2rem]">
									{nextLesson?.lesson.title ?? 'Keep going'}
								</p>
								<p className="mt-1 max-w-[18rem] text-sm leading-6 text-slate-600 dark:text-white/68 sm:text-lg sm:leading-7">
									{nextLesson?.lesson.description ??
										'Pick up where you left off and keep progressing.'}
								</p>
								{nextLesson ? (
									<Button
										asChild
										className="mt-5 h-12 rounded-full bg-lime-400 px-6 text-base font-semibold text-[#11202d] hover:bg-lime-300"
									>
										<Link to={`/lesson/${nextLesson.lesson.id}`}>
											Start lesson
										</Link>
									</Button>
								) : null}
							</SummaryCell>

							<SummaryCell>
								<div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-white/56">
									<span>Review due</span>
									<span className="size-3 rounded-full bg-amber-400" />
								</div>
								<div className="mt-4 flex items-center gap-4 sm:gap-5">
									<div className="flex size-20 items-center justify-center rounded-full bg-slate-100 text-center dark:bg-white/6 sm:size-24">
										<div>
											<p className="text-2xl font-black leading-none text-slate-950 dark:text-white sm:text-[2rem]">
												{dueReview}
											</p>
											<p className="mt-1 text-sm text-slate-500 dark:text-white/56">
												cards
											</p>
										</div>
									</div>
									<div>
										<p className="max-w-[11rem] text-sm leading-6 text-slate-600 dark:text-white/68 sm:text-lg sm:leading-7">
											Review to keep your streak strong.
										</p>
										<Button
											asChild
											variant="link"
											className="mt-3 h-auto p-0 text-base font-semibold text-[#57a8ff] hover:text-[#83c0ff]"
										>
											<Link to="/review">Start review</Link>
										</Button>
									</div>
								</div>
							</SummaryCell>

							<SummaryCell>
								<p className="text-sm font-medium text-slate-500 dark:text-white/56">
									Current section
								</p>
								<p className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:mt-3 sm:text-[2rem]">
									Section {activeUnitView?.unit.order ?? 1}
								</p>
								<p className="mt-1 text-xl font-medium text-slate-600 dark:text-white/72 sm:text-[1.7rem]">
									{activeUnitView?.unit.title}
								</p>
								<div className="mt-5 flex items-center gap-3 sm:mt-6 sm:gap-4">
									<Progress
										value={
											activeUnitLessons.length
												? (completedUnitLessons / activeUnitLessons.length) *
													100
												: 0
										}
										className="h-3 bg-slate-200 dark:bg-white/8"
									/>
									<span className="shrink-0 text-sm text-slate-500 dark:text-white/58 sm:text-base">
										{completedUnitLessons} / {activeUnitLessons.length} lessons
									</span>
								</div>
							</SummaryCell>
						</div>
					</Card>

					<div className="xl:hidden">
						<LearnSideRail
							quests={questCounts.activeDaily}
							onClaim={(questId) => void claimQuest(questId)}
							dailyChestState={dailyChestState}
							onOpenDailyChest={handleOpenDailyChest}
						/>
					</div>

					<div className="-mx-3 rounded-none px-3 py-4 sm:mx-auto sm:max-w-[920px] sm:rounded-[32px] sm:px-6 sm:py-5 lg:px-8">
						{activeHeaderUnit ? (
							<SectionPathHeader
								key={activeHeaderUnit.unit.id}
								unitView={activeHeaderUnit}
								tone={activeHeaderTone}
							/>
						) : null}

						<div className="pt-2">
							{learnUnits.map((unitView) => {
								const tone = getSectionTone(unitView.unit.order)

								return (
									<div
										key={unitView.unit.id}
										ref={(node) => {
											sectionRefs.current[unitView.unit.id] = node
										}}
									>
										<LearnPathCanvas
											unitView={unitView}
											activeLessonId={
												nextLesson?.lesson.id ?? snapshot.currentLessonId
											}
											onOpenPathChest={handleOpenPathChest}
											tone={tone}
											reducedMotion={snapshot.settings.reducedMotion}
										/>
									</div>
								)
							})}
						</div>
					</div>
				</div>

				<aside className="hidden xl:block">
					<div className="sticky top-24">
						<LearnSideRail
							quests={questCounts.activeDaily}
							onClaim={(questId) => void claimQuest(questId)}
							dailyChestState={dailyChestState}
							onOpenDailyChest={handleOpenDailyChest}
						/>
					</div>
				</aside>
			</div>
		</div>
	)
}
