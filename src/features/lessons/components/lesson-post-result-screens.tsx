import { motion } from 'framer-motion'
import { ArrowRight, Check, Sparkles, Trophy } from 'lucide-react'
import type { ReactNode } from 'react'

import { StreakFlame } from '@/components/common/streak-flame'
import { Button } from '@/components/ui/button'
import type { Achievement } from '@/lib/domain/models'
import { getStreakWeekActivity } from '@/lib/domain/streak'
import { cn } from '@/lib/utils'

type LessonStreakScreenProps = {
	streak: number
	lastActiveOn?: string
	reducedMotion: boolean
	onContinue: () => void
}

type LessonAchievementsScreenProps = {
	achievements: Achievement[]
	reducedMotion: boolean
	onContinue: () => void
}

function PostResultShell({
	children,
	reducedMotion,
	labelledBy,
}: {
	children: ReactNode
	reducedMotion: boolean
	labelledBy: string
}) {
	return (
		<motion.section
			className="relative -mx-3 -my-5 min-h-[calc(100vh-5rem)] overflow-hidden bg-[#0f2028] px-4 pb-32 pt-10 text-white sm:-mx-4 sm:-my-6 sm:px-6 lg:-mx-8 lg:-my-7 lg:min-h-screen lg:px-8"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: reducedMotion ? 0.1 : 0.25 }}
			aria-labelledby={labelledBy}
		>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,146,60,0.16),transparent_30%),linear-gradient(180deg,#0d1b22_0%,#10232b_100%)]" />
			{children}
		</motion.section>
	)
}

function BottomContinue({ onContinue }: { onContinue: () => void }) {
	return (
		<div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0f2028]/95 px-4 py-4 backdrop-blur lg:left-[236px]">
			<div className="mx-auto flex w-full max-w-2xl justify-end">
				<Button
					type="button"
					className="h-14 w-full rounded-2xl bg-lime-400 text-sm font-black uppercase tracking-[0.08em] text-slate-950 shadow-[0_6px_0_rgba(0,0,0,0.22)] hover:translate-y-0.5 hover:bg-lime-300 hover:shadow-[0_4px_0_rgba(0,0,0,0.22)] sm:w-48"
					onClick={onContinue}
				>
					Continue
					<ArrowRight className="size-4" />
				</Button>
			</div>
		</div>
	)
}

export function LessonStreakScreen({
	streak,
	lastActiveOn,
	reducedMotion,
	onContinue,
}: LessonStreakScreenProps) {
	const weekActivity = getStreakWeekActivity({ streak, lastActiveOn })

	return (
		<PostResultShell reducedMotion={reducedMotion} labelledBy="streak-title">
			<div className="relative mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-xl flex-col items-center justify-center text-center">
				<motion.div
					initial={{ opacity: 0, y: reducedMotion ? 0 : 16, scale: 0.94 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: reducedMotion ? 0.1 : 0.35 }}
					className="flex flex-col items-center"
				>
					<StreakFlame
						streak={streak}
						title={`${streak} day streak`}
						className="size-28 drop-shadow-[0_18px_30px_rgba(251,146,60,0.28)]"
					/>
					<h1
						id="streak-title"
						className="mt-7 text-8xl font-black leading-none tracking-tight text-orange-400"
					>
						{streak}
					</h1>
					<p className="mt-3 text-2xl font-black text-orange-300">day streak</p>
				</motion.div>

				<div className="mt-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/16 bg-[#10212a]">
					<div className="grid grid-cols-7 gap-2 px-5 pb-5 pt-4">
						{weekActivity.map((day) => (
							<div key={day.date} className="space-y-2 text-center">
								<p
									className={cn(
										'text-sm font-black',
										day.isToday ? 'text-orange-300' : 'text-white/35'
									)}
								>
									{day.label}
								</p>
								<div
									className={cn(
										'mx-auto flex size-9 items-center justify-center rounded-full',
										day.isActive
											? 'bg-orange-400 text-slate-950'
											: 'bg-slate-600/70 text-white/30'
									)}
								>
									{day.isActive ? (
										<Check className="size-5 stroke-[4]" />
									) : null}
								</div>
							</div>
						))}
					</div>
					<div className="border-t border-white/10 px-5 py-4">
						<p className="text-base font-black leading-7 text-white">
							But your streak will reset if you don&apos;t practice tomorrow.
							Watch out!
						</p>
					</div>
				</div>
			</div>
			<BottomContinue onContinue={onContinue} />
		</PostResultShell>
	)
}

export function LessonAchievementsScreen({
	achievements,
	reducedMotion,
	onContinue,
}: LessonAchievementsScreenProps) {
	const plural = achievements.length !== 1

	return (
		<PostResultShell
			reducedMotion={reducedMotion}
			labelledBy="achievements-title"
		>
			<div className="relative mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-2xl flex-col items-center justify-center text-center">
				<motion.div
					initial={{ opacity: 0, y: reducedMotion ? 0 : 16, scale: 0.94 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: reducedMotion ? 0.1 : 0.35 }}
					className="flex flex-col items-center"
				>
					<div className="flex size-20 items-center justify-center rounded-[28px] bg-amber-300 text-slate-950 shadow-[0_12px_0_rgba(0,0,0,0.22)]">
						<Trophy className="size-10" />
					</div>
					<p className="mt-7 text-sm font-black uppercase tracking-[0.22em] text-lime-300">
						New reward
					</p>
					<h1
						id="achievements-title"
						className="mt-3 text-4xl font-black tracking-tight text-amber-300 sm:text-5xl"
					>
						{plural ? 'Achievements Unlocked!' : 'Achievement Unlocked!'}
					</h1>
				</motion.div>

				<div className="mt-8 grid w-full gap-3">
					{achievements.map((achievement) => (
						<div
							key={achievement.id}
							className="flex items-center gap-4 rounded-3xl border border-white/12 bg-white/[0.06] p-4 text-left shadow-[0_8px_0_rgba(0,0,0,0.16)]"
						>
							<div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-4xl">
								{achievement.icon}
							</div>
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<Sparkles className="size-5 shrink-0 text-amber-300" />
									<p className="text-lg font-black text-white">
										{achievement.title}
									</p>
								</div>
								<p className="mt-1 text-sm leading-6 text-white/66">
									{achievement.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
			<BottomContinue onContinue={onContinue} />
		</PostResultShell>
	)
}
