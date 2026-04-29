import { motion } from 'framer-motion'
import {
	ArrowRight,
	Flame,
	RotateCcw,
	Sparkles,
	Star,
	Target,
	Trophy,
	Zap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type LessonCompletionBonus = {
	kind: 'streak' | 'daily-goal'
	title: string
	body: string
	value: string
	completed?: boolean
}

export type LessonCompletionSummary = {
	title: string
	totalXp: number
	accuracy: number
	passed: boolean
	bonuses: LessonCompletionBonus[]
}

type LessonCompletionScreenProps = {
	summary: LessonCompletionSummary
	reducedMotion: boolean
	onPracticeAgain: () => void
	onContinue: () => void
}

function CelebrationBurst({
	className,
	delay = 0,
	reducedMotion,
}: {
	className?: string
	delay?: number
	reducedMotion: boolean
}) {
	return (
		<motion.div
			aria-hidden="true"
			className={cn('absolute size-12', className)}
			initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
			animate={{ opacity: 1, scale: 1, rotate: 0 }}
			transition={{ duration: reducedMotion ? 0.1 : 0.35, delay }}
		>
			<div className="absolute left-1/2 top-1/2 h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300" />
			<div className="absolute left-1/2 top-1/2 h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-90 rounded-full bg-lime-300" />
			<div className="absolute left-1/2 top-1/2 h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-rose-400" />
			<div className="absolute left-1/2 top-1/2 h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-sky-300" />
		</motion.div>
	)
}

function CompletionIllustration({
	passed,
	reducedMotion,
}: {
	passed: boolean
	reducedMotion: boolean
}) {
	return (
		<div className="relative mx-auto h-72 w-full max-w-md sm:h-80">
			<CelebrationBurst
				className="left-[12%] top-[26%]"
				delay={0.1}
				reducedMotion={reducedMotion}
			/>
			<CelebrationBurst
				className="right-[18%] top-[7%] size-10"
				delay={0.18}
				reducedMotion={reducedMotion}
			/>
			<motion.div
				aria-hidden="true"
				className="absolute bottom-8 left-1/2 h-2 w-[82%] -translate-x-1/2 rounded-full bg-white/20"
				initial={{ opacity: 0, scaleX: 0.6 }}
				animate={{ opacity: 1, scaleX: 1 }}
				transition={{ duration: reducedMotion ? 0.1 : 0.35 }}
			/>
			<motion.div
				className="absolute bottom-10 left-[18%] flex h-48 w-36 origin-bottom flex-col items-center"
				initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: reducedMotion ? 0.1 : 0.45 }}
			>
				<div className="relative h-20 w-24 rounded-[28px] bg-[#ffc4b4] shadow-[inset_-8px_-8px_0_rgba(0,0,0,0.05)]">
					<div className="absolute -left-3 top-0 h-24 w-8 rounded-full bg-amber-400" />
					<div className="absolute -top-4 left-1 h-8 w-24 rounded-full bg-amber-400" />
					<div className="absolute left-1/2 top-3 h-3 w-24 -translate-x-1/2 rounded-full bg-rose-500" />
					<div className="absolute left-12 top-9 flex gap-3">
						<div className="h-3 w-4 rounded-b-full bg-slate-800" />
						<div className="h-3 w-4 rounded-b-full bg-slate-800" />
					</div>
					<div className="absolute bottom-3 right-7 h-5 w-7 rounded-b-full bg-white" />
				</div>
				<div className="relative h-24 w-28 rounded-[28px] bg-rose-500">
					<div className="absolute -left-5 top-7 h-16 w-8 rotate-[-28deg] rounded-full bg-[#ffc4b4]" />
					<div className="absolute -right-8 top-0 h-16 w-8 rotate-[-42deg] rounded-full bg-[#ffc4b4]" />
					<div className="absolute -right-12 top-3 h-10 w-10 rounded-2xl bg-[#ffc4b4]" />
					<div className="absolute bottom-0 h-7 w-full rounded-b-[28px] bg-rose-700" />
					<div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-white/80" />
				</div>
				<div className="flex w-24 justify-between">
					<div className="h-16 w-5 rounded-full bg-[#ffc4b4]" />
					<div className="h-16 w-5 rounded-full bg-[#ffc4b4]" />
				</div>
				<div className="flex w-32 justify-between">
					<div className="h-3 w-9 rounded-full bg-rose-500" />
					<div className="h-3 w-9 rounded-full bg-rose-500" />
				</div>
			</motion.div>
			<motion.div
				className="absolute bottom-10 right-[16%] flex h-28 w-28 items-center justify-center rounded-[42%_58%_47%_53%] bg-lime-500 shadow-[inset_-10px_-12px_0_rgba(0,0,0,0.12)]"
				initial={{ opacity: 0, y: reducedMotion ? 0 : 16, scale: 0.92 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: reducedMotion ? 0.1 : 0.4, delay: 0.08 }}
			>
				<div className="absolute -left-4 top-8 h-12 w-10 rounded-full bg-lime-500" />
				<div className="absolute -right-4 top-8 h-12 w-10 rounded-full bg-lime-500" />
				<div className="absolute left-7 top-8 h-8 w-8 rounded-full bg-white">
					<div className="absolute right-1 top-2 h-4 w-3 rounded-full bg-slate-800" />
				</div>
				<div className="absolute right-7 top-8 h-8 w-8 rounded-full bg-white">
					<div className="absolute left-1 top-2 h-4 w-3 rounded-full bg-slate-800" />
				</div>
				<div className="absolute bottom-9 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-amber-400" />
				<div className="absolute bottom-6 left-1/2 h-4 w-10 -translate-x-1/2 rounded-b-full border-b-4 border-lime-200" />
				{passed ? (
					<Sparkles className="absolute -top-3 right-1 size-8 text-amber-300" />
				) : (
					<Star className="absolute -top-3 right-1 size-8 text-sky-300" />
				)}
			</motion.div>
		</div>
	)
}

function CompletionStatTile({
	label,
	value,
	icon,
	tone,
}: {
	label: string
	value: string
	icon: 'xp' | 'accuracy'
	tone: 'gold' | 'lime'
}) {
	const Icon = icon === 'xp' ? Zap : Target

	return (
		<div
			className={cn(
				'overflow-hidden rounded-2xl border-2 bg-[#101f28] text-center shadow-[0_8px_0_rgba(0,0,0,0.22)]',
				tone === 'gold' ? 'border-amber-300' : 'border-lime-400'
			)}
		>
			<div
				className={cn(
					'px-4 py-2 text-xs font-black uppercase text-slate-950',
					tone === 'gold' ? 'bg-amber-300' : 'bg-lime-400'
				)}
			>
				{label}
			</div>
			<div className="flex min-h-16 items-center justify-center gap-2 px-4 py-4 text-xl font-black text-white">
				<Icon
					className={cn(
						'size-6',
						tone === 'gold' ? 'text-amber-300' : 'text-lime-300'
					)}
				/>
				{value}
			</div>
		</div>
	)
}

function CompletionBonusCallout({ bonus }: { bonus: LessonCompletionBonus }) {
	const Icon =
		bonus.kind === 'streak' ? Flame : bonus.completed ? Sparkles : Star

	return (
		<div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left">
			<div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
				<Icon className="size-5" />
			</div>
			<div>
				<p className="text-sm font-black text-white">{bonus.title}</p>
				<p className="mt-1 text-sm font-semibold text-lime-200">
					{bonus.value}
				</p>
				<p className="mt-1 text-sm leading-5 text-white/62">{bonus.body}</p>
			</div>
		</div>
	)
}

export function LessonCompletionScreen({
	summary,
	reducedMotion,
	onPracticeAgain,
	onContinue,
}: LessonCompletionScreenProps) {
	const title = summary.passed ? 'Practice Complete!' : 'Good practice'
	const body = summary.passed
		? `${summary.title} is wrapped. Keep the momentum rolling.`
		: `${summary.title} is worth another pass. You still earned progress.`

	return (
		<motion.section
			className="relative -mx-3 -my-5 min-h-[calc(100vh-5rem)] overflow-hidden bg-[#0f2028] px-4 pb-36 pt-8 text-white sm:-mx-4 sm:-my-6 sm:px-6 lg:-mx-8 lg:-my-7 lg:min-h-screen lg:px-8"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: reducedMotion ? 0.1 : 0.25 }}
			aria-labelledby="lesson-completion-title"
		>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(132,204,22,0.14),transparent_32%),linear-gradient(180deg,#0d1b22_0%,#10232b_100%)]" />
			<div className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center">
				<CompletionIllustration
					passed={summary.passed}
					reducedMotion={reducedMotion}
				/>
				<div className="max-w-xl">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-300 text-slate-950 shadow-[0_8px_0_rgba(0,0,0,0.24)]">
						<Trophy className="size-7" />
					</div>
					<h1
						id="lesson-completion-title"
						className="text-3xl font-black tracking-tight text-amber-300 sm:text-4xl"
					>
						{title}
					</h1>
					<p className="mt-3 text-base font-medium leading-7 text-white/68">
						{body}
					</p>
				</div>

				<div className="mt-8 grid w-full max-w-md grid-cols-2 gap-4">
					<CompletionStatTile
						label="Total XP"
						value={String(summary.totalXp)}
						icon="xp"
						tone="gold"
					/>
					<CompletionStatTile
						label="Accuracy"
						value={`${summary.accuracy}%`}
						icon="accuracy"
						tone="lime"
					/>
				</div>

				{summary.bonuses.length > 0 ? (
					<div className="mt-6 grid w-full max-w-xl gap-3 sm:grid-cols-2">
						{summary.bonuses.map((bonus) => (
							<CompletionBonusCallout
								key={`${bonus.kind}-${bonus.title}`}
								bonus={bonus}
							/>
						))}
					</div>
				) : null}
			</div>

			<div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0f2028]/95 px-4 py-4 backdrop-blur lg:left-[236px]">
				<div className="mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-[1fr_1fr]">
					<Button
						type="button"
						variant="ghost"
						className={cn(
							'order-2 h-14 rounded-2xl border-2 border-white/14 bg-white/5 text-sm font-black uppercase tracking-[0.08em] text-white/70 hover:bg-white/10 hover:text-white sm:order-1',
							!summary.passed && 'border-sky-300/50 text-sky-200'
						)}
						onClick={summary.passed ? onPracticeAgain : onContinue}
					>
						{summary.passed ? (
							<>
								<RotateCcw className="size-4" />
								Practice Again
							</>
						) : (
							<>
								Continue
								<ArrowRight className="size-4" />
							</>
						)}
					</Button>
					<Button
						type="button"
						className={cn(
							'order-1 h-14 rounded-2xl text-sm font-black uppercase tracking-[0.08em] text-slate-950 shadow-[0_6px_0_rgba(0,0,0,0.22)] hover:translate-y-0.5 hover:shadow-[0_4px_0_rgba(0,0,0,0.22)] sm:order-2',
							summary.passed
								? 'bg-lime-400 hover:bg-lime-300'
								: 'bg-sky-300 hover:bg-sky-200'
						)}
						onClick={summary.passed ? onContinue : onPracticeAgain}
					>
						{summary.passed ? (
							<>
								Continue
								<ArrowRight className="size-4" />
							</>
						) : (
							<>
								<RotateCcw className="size-4" />
								Practice Again
							</>
						)}
					</Button>
				</div>
			</div>
		</motion.section>
	)
}
