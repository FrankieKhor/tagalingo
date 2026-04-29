import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ExerciseRenderer } from '@/components/exercise/exercise-renderer'
import { LessonIntroCard } from '@/components/lesson/lesson-intro-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	createSkippedExerciseResult,
	createSkippedSpeakingResult,
	isSpeakingExercise,
} from '@/lib/domain/lesson-engine'
import { isSpeakingSkipActive, LESSON_PASS_SCORE } from '@/lib/domain/progress'
import type { ProgressSnapshot } from '@/lib/domain/models'
import { Progress } from '@/components/ui/progress'
import {
	LessonCompletionScreen,
	type LessonCompletionBonus,
	type LessonCompletionSummary,
} from '@/features/lessons/components/lesson-completion-screen'
import {
	LessonAchievementsScreen,
	LessonStreakScreen,
} from '@/features/lessons/components/lesson-post-result-screens'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import { appServices } from '@/lib/services/app-services'
import { achievementCatalog } from '@/content'
import type {
	Achievement,
	Exercise,
	ExerciseAnswer,
	ExerciseResult,
	Lesson,
} from '@/lib/domain/models'
import { useAppStore } from '@/store/use-app-store'
import { toISODate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils'

function defaultAnswer(): ExerciseAnswer {
	return ''
}

function isAnswerReady(answer: ExerciseAnswer, exercise?: Exercise) {
	if (!exercise) {
		return false
	}

	if (exercise.type === 'word-matching') {
		const pairs =
			typeof answer === 'object' && !Array.isArray(answer) ? answer : {}
		return exercise.pairs.every(
			(pair) =>
				typeof pairs[pair.left] === 'string' &&
				pairs[pair.left].trim().length > 0
		)
	}

	if (typeof answer === 'string') {
		return answer.trim().length > 0
	}

	if (Array.isArray(answer)) {
		return answer.length > 0
	}

	return Object.keys(answer).length > 0
}

function formatSkipUntil(isoValue?: string) {
	if (!isoValue) {
		return ''
	}

	return new Intl.DateTimeFormat('en-GB', {
		hour: 'numeric',
		minute: '2-digit',
	}).format(new Date(isoValue))
}

function normalizeGlossKey(value: string) {
	return value
		.toLowerCase()
		.replace(/[.,!?]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
}

function extractQuotedMeaning(helperText?: string) {
	if (!helperText) {
		return undefined
	}

	const match = helperText.match(/means\s+"([^"]+)"/i)
	return match?.[1]
}

function extractQuotedGloss(text?: string) {
	if (!text) {
		return undefined
	}

	const match = text.match(/"([^"]+)"\s+means\s+"([^"]+)"/i)

	if (!match) {
		return undefined
	}

	return {
		source: match[1],
		meaning: match[2],
	}
}

function buildAudioMeaningLookup(
	units: ReturnType<typeof appServices.lessonService.getUnits>
) {
	const lookup = new Map<string, string>()

	function register(source?: string, meaning?: string) {
		if (!source || !meaning) {
			return
		}

		const key = normalizeGlossKey(source)

		if (!lookup.has(key)) {
			lookup.set(key, meaning)
		}
	}

	for (const unit of units) {
		for (const category of unit.categories) {
			for (const lesson of category.lessons) {
				for (const card of lesson.introCards) {
					register(card.audioText ?? card.tagalog, card.meaning)

					const exampleGloss = extractQuotedGloss(card.example)
					register(exampleGloss?.source, exampleGloss?.meaning)
				}

				for (const item of lesson.exercises) {
					switch (item.type) {
						case 'listening-mcq':
							register(item.audioText, item.correctAnswer)
							break
						case 'dictation':
							register(item.audioText, extractQuotedMeaning(item.helperText))
							break
						case 'listen-repeat':
							register(item.audioText, extractQuotedMeaning(item.helperText))
							register(
								item.expectedTranscript,
								extractQuotedMeaning(item.helperText)
							)
							break
						case 'speaking-prompt':
							register(item.expectedTranscript, item.referenceTranslation)
							break
						default:
							break
					}
				}
			}
		}
	}

	return lookup
}

function shuffleExerciseIds(exerciseIds: string[]) {
	const shuffled = [...exerciseIds]

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1))
		;[shuffled[index], shuffled[randomIndex]] = [
			shuffled[randomIndex],
			shuffled[index],
		]
	}

	return shuffled
}

function chooseRetryInsertIndex(queueLength: number, currentIndex: number) {
	const earliestLaterIndex = currentIndex + 2

	if (earliestLaterIndex > queueLength) {
		return queueLength
	}

	const availableSlots = queueLength - earliestLaterIndex + 1
	return earliestLaterIndex + Math.floor(Math.random() * availableSlots)
}

type LessonPhase =
	| 'intro'
	| 'exercise'
	| 'completion'
	| 'streak'
	| 'achievements'
type LessonCelebration = LessonCompletionBonus

type PostLessonResult = {
	streak?: {
		streak: number
		lastActiveOn?: string
	}
	achievements: Achievement[]
}

function getLatestExerciseResults(results: ExerciseResult[]) {
	const latestResults = new Map<string, ExerciseResult>()

	results.forEach((result) => {
		latestResults.set(result.exerciseId, result)
	})

	return Array.from(latestResults.values())
}

function buildLessonCompletionSummary(
	lesson: Lesson,
	results: ExerciseResult[],
	bonuses: LessonCelebration[]
): LessonCompletionSummary {
	const latestResults = getLatestExerciseResults(results)
	const accuracy = Math.round(
		(latestResults.filter((result) => result.correct).length /
			lesson.exercises.length) *
			100
	)

	return {
		title: lesson.title,
		totalXp: results.reduce((sum, result) => sum + result.earnedXp, 0),
		accuracy,
		passed: accuracy >= LESSON_PASS_SCORE,
		bonuses,
	}
}

function buildDailyGoalCelebrations(
	beforeSnapshot: ProgressSnapshot,
	afterSnapshot: ProgressSnapshot
): LessonCelebration[] {
	const celebrations: LessonCelebration[] = []
	const beforeDailyXp = beforeSnapshot.profile.dailyGoal.currentXp
	const afterDailyXp = afterSnapshot.profile.dailyGoal.currentXp
	const dailyXpTarget = afterSnapshot.profile.dailyGoal.xpTarget

	if (beforeDailyXp < dailyXpTarget && afterDailyXp > beforeDailyXp) {
		const cappedBefore = Math.min(beforeDailyXp, dailyXpTarget)
		const cappedAfter = Math.min(afterDailyXp, dailyXpTarget)
		const completed = afterDailyXp >= dailyXpTarget

		celebrations.push({
			kind: 'daily-goal',
			title: completed ? 'Daily XP complete' : 'Daily XP climbing',
			body: completed
				? `You hit your goal for today with ${cappedAfter}/${dailyXpTarget} XP.`
				: `Today's XP moved from ${cappedBefore}/${dailyXpTarget} to ${cappedAfter}/${dailyXpTarget}.`,
			value: `${cappedAfter}/${dailyXpTarget} XP`,
			completed,
		})
	}

	return celebrations
}

function buildPostLessonResult(
	beforeSnapshot: ProgressSnapshot,
	afterSnapshot: ProgressSnapshot,
	passed: boolean
): PostLessonResult {
	if (!passed) {
		return { achievements: [] }
	}

	const today = toISODate()
	const shouldShowStreak =
		beforeSnapshot.profile.lastActiveOn !== today &&
		afterSnapshot.profile.lastActiveOn === today
	const beforeAchievements = new Set(beforeSnapshot.profile.achievements)
	const newAchievementIds = afterSnapshot.profile.achievements.filter(
		(id) => !beforeAchievements.has(id)
	)

	return {
		streak: shouldShowStreak
			? {
					streak: afterSnapshot.profile.streak,
					lastActiveOn: afterSnapshot.profile.lastActiveOn,
				}
			: undefined,
		achievements: achievementCatalog.filter((achievement) =>
			newAchievementIds.includes(achievement.id)
		),
	}
}

export function LessonPlayerPage() {
	const { lessonId = '' } = useParams()
	const getLesson = useAppStore((state) => state.getLesson)
	const completeLesson = useAppStore((state) => state.completeLesson)
	const snapshot = useAppStore((state) => state.snapshot)
	const units = useAppStore((state) => state.units)
	const soundEnabled = useAppStore(
		(state) => state.snapshot.settings.soundEnabled
	)
	const voiceCapability = useAppStore((state) => state.voiceCapability)
	const lesson = getLesson(lessonId)
	const navigate = useNavigate()

	const [introIndex, setIntroIndex] = useState(0)
	const [answer, setAnswer] = useState<ExerciseAnswer>(defaultAnswer())
	const [results, setResults] = useState<ExerciseResult[]>([])
	const [checkedResult, setCheckedResult] = useState<ExerciseResult | null>(
		null
	)
	const [listening, setListening] = useState(false)
	const [phase, setPhase] = useState<LessonPhase>('intro')
	const [skipNotice, setSkipNotice] = useState<string | null>(null)
	const [queueIndex, setQueueIndex] = useState(0)
	const [completionSummary, setCompletionSummary] =
		useState<LessonCompletionSummary | null>(null)
	const [postLessonResult, setPostLessonResult] =
		useState<PostLessonResult | null>(null)
	const [quitDialogOpen, setQuitDialogOpen] = useState(false)
	const [exerciseQueue, setExerciseQueue] = useState<string[]>(() =>
		shuffleExerciseIds(lesson?.exercises.map((exercise) => exercise.id) ?? [])
	)

	useEffect(() => {
		setIntroIndex(0)
		setAnswer(defaultAnswer())
		setResults([])
		setCheckedResult(null)
		setListening(false)
		setPhase('intro')
		setSkipNotice(null)
		setQueueIndex(0)
		setCompletionSummary(null)
		setPostLessonResult(null)
		setExerciseQueue(
			shuffleExerciseIds(lesson?.exercises.map((exercise) => exercise.id) ?? [])
		)
	}, [lesson?.exercises, lesson?.id])

	const exercise = lesson?.exercises.find(
		(candidate) => candidate.id === exerciseQueue[queueIndex]
	)
	const introCard = lesson?.introCards[introIndex]
	const progressValue = useMemo(() => {
		if (!lesson) {
			return 0
		}

		const totalScreens = lesson.introCards.length + exerciseQueue.length
		const completedScreens =
			phase === 'completion' || phase === 'streak' || phase === 'achievements'
				? totalScreens
				: phase === 'intro'
					? introIndex + 1
					: lesson.introCards.length + queueIndex + 1

		return (completedScreens / totalScreens) * 100
	}, [exerciseQueue.length, introIndex, lesson, phase, queueIndex])

	const activeLesson = lesson
	const activeExercise = phase === 'exercise' ? exercise : undefined
	const activeIntroCard = phase === 'intro' ? introCard : undefined
	const speakingSkipActive = isSpeakingSkipActive(snapshot)
	const speakingSkipUntilLabel = formatSkipUntil(snapshot.speakingSkipUntil)
	const audioMeaningLookup = useMemo(
		() => buildAudioMeaningLookup(units),
		[units]
	)
	const activeAudioMeaning = useMemo(() => {
		if (!activeExercise) {
			return undefined
		}

		const transcript =
			activeExercise.type === 'listen-repeat'
				? activeExercise.expectedTranscript
				: 'audioText' in activeExercise
					? activeExercise.audioText
					: undefined

		return transcript
			? audioMeaningLookup.get(normalizeGlossKey(transcript))
			: undefined
	}, [activeExercise, audioMeaningLookup])

	const finishLesson = useCallback(
		async (nextResults: ExerciseResult[]) => {
			if (!activeLesson) {
				return
			}

			const updatedSnapshot = await completeLesson(activeLesson, nextResults)
			const nextCelebrations = buildDailyGoalCelebrations(
				snapshot,
				updatedSnapshot
			)
			const nextCompletionSummary = buildLessonCompletionSummary(
				activeLesson,
				nextResults,
				nextCelebrations
			)

			setCompletionSummary(nextCompletionSummary)
			setPostLessonResult(
				buildPostLessonResult(
					snapshot,
					updatedSnapshot,
					nextCompletionSummary.passed
				)
			)
			setPhase('completion')
		},
		[activeLesson, completeLesson, snapshot]
	)

	function continuePostLessonFlow() {
		if (phase === 'completion' && postLessonResult?.streak) {
			setPhase('streak')
			return
		}

		if (
			(phase === 'completion' || phase === 'streak') &&
			postLessonResult?.achievements.length
		) {
			setPhase('achievements')
			return
		}

		navigate('/')
	}

	function resetLessonRun() {
		setIntroIndex(0)
		setAnswer(defaultAnswer())
		setResults([])
		setCheckedResult(null)
		setListening(false)
		setPhase('intro')
		setSkipNotice(null)
		setQueueIndex(0)
		setCompletionSummary(null)
		setPostLessonResult(null)
		setExerciseQueue(
			shuffleExerciseIds(activeLesson?.exercises.map((item) => item.id) ?? [])
		)
	}

	useEffect(() => {
		if (!speakingSkipActive || !snapshot.speakingSkipUntil) {
			return
		}

		setSkipNotice(
			`Speaking tasks will be skipped until ${formatSkipUntil(snapshot.speakingSkipUntil)}.`
		)
	}, [snapshot.speakingSkipUntil, speakingSkipActive])

	useEffect(() => {
		if (
			phase !== 'exercise' ||
			!activeExercise ||
			checkedResult ||
			!speakingSkipActive ||
			!isSpeakingExercise(activeExercise)
		) {
			return
		}

		const skippedResult = createSkippedSpeakingResult(activeExercise)
		const nextResults = [...results, skippedResult]

		setResults(nextResults)
		setAnswer(defaultAnswer())

		if (queueIndex === exerciseQueue.length - 1) {
			void finishLesson(nextResults)
			return
		}

		setQueueIndex(queueIndex + 1)
	}, [
		activeExercise,
		checkedResult,
		exerciseQueue.length,
		finishLesson,
		phase,
		queueIndex,
		results,
		speakingSkipActive,
	])

	if (
		!activeLesson ||
		(phase === 'exercise' && !activeExercise) ||
		(phase === 'intro' && !activeIntroCard) ||
		(phase === 'completion' && !completionSummary) ||
		(phase === 'streak' && !postLessonResult?.streak) ||
		(phase === 'achievements' && !postLessonResult?.achievements.length)
	) {
		return (
			<Card>
				<CardContent className="p-6 text-sm text-slate-600 dark:text-white/70">
					Lesson not found. Head back to the path and pick another one.
				</CardContent>
			</Card>
		)
	}

	if (phase === 'completion' && completionSummary) {
		return (
			<LessonCompletionScreen
				summary={completionSummary}
				reducedMotion={snapshot.settings.reducedMotion}
				onPracticeAgain={resetLessonRun}
				onContinue={continuePostLessonFlow}
			/>
		)
	}

	if (phase === 'streak' && postLessonResult?.streak) {
		return (
			<LessonStreakScreen
				streak={postLessonResult.streak.streak}
				lastActiveOn={postLessonResult.streak.lastActiveOn}
				reducedMotion={snapshot.settings.reducedMotion}
				onContinue={continuePostLessonFlow}
			/>
		)
	}

	if (phase === 'achievements' && postLessonResult?.achievements.length) {
		return (
			<LessonAchievementsScreen
				achievements={postLessonResult.achievements}
				reducedMotion={snapshot.settings.reducedMotion}
				onContinue={continuePostLessonFlow}
			/>
		)
	}

	async function handleUseMic() {
		if (!voiceCapability.recognitionAvailable) {
			return
		}

		setListening(true)

		try {
			const transcript = await appServices.voiceService.listenOnce()
			setAnswer(transcript)
		} catch {
			setAnswer(typeof answer === 'string' ? answer : '')
		} finally {
			setListening(false)
		}
	}

	function handleCheck() {
		if (
			!activeLesson ||
			!activeExercise ||
			!isAnswerReady(answer, activeExercise)
		) {
			return
		}

		const speakingAttempt =
			activeExercise.type === 'listen-repeat' ||
			activeExercise.type === 'speaking-prompt'
				? appServices.voiceService.evaluate(
						activeExercise.expectedTranscript,
						String(answer),
						true
					)
				: undefined
		const result = appServices.lessonService.evaluate(
			activeLesson.id,
			activeExercise,
			answer,
			speakingAttempt
		)

		if (soundEnabled) {
			if (result.correct) {
				void appServices.soundEffectsService.playCorrect()
			} else {
				void appServices.soundEffectsService.playWrong()
			}
		}

		setCheckedResult(result)
	}

	function handleSkipExercise() {
		if (!activeLesson || !activeExercise) {
			return
		}

		const result = createSkippedExerciseResult(activeLesson.id, activeExercise)

		if (soundEnabled) {
			void appServices.soundEffectsService.playWrong()
		}

		setCheckedResult(result)
	}

	function handleContinue() {
		if (!checkedResult || !activeExercise) {
			return
		}

		const nextResults = [...results, checkedResult]
		setResults(nextResults)
		setCheckedResult(null)
		setAnswer(defaultAnswer())

		if (checkedResult.correct && queueIndex === exerciseQueue.length - 1) {
			void finishLesson(nextResults)
			return
		}

		if (!checkedResult.correct) {
			const retryInsertIndex = chooseRetryInsertIndex(
				exerciseQueue.length,
				queueIndex
			)
			const nextQueue = [...exerciseQueue]
			nextQueue.splice(retryInsertIndex, 0, activeExercise.id)
			setExerciseQueue(nextQueue)
		}

		setQueueIndex(queueIndex + 1)
	}

	function dismissSkipNotice() {
		setSkipNotice(null)
		setAnswer(defaultAnswer())
	}

	function renderCorrectAnswer(answer: string) {
		if (activeExercise?.type !== 'word-matching') {
			return <span className="font-semibold">{answer}</span>
		}

		return (
			<div className="space-y-2">
				{answer.split(', ').map((pair) => (
					<div
						key={pair}
						className="rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-rose-700 dark:bg-white/5 dark:text-rose-100"
					>
						{pair}
					</div>
				))}
			</div>
		)
	}

	function handleIntroContinue() {
		if (!activeLesson || !activeIntroCard) {
			return
		}

		if (introIndex === activeLesson.introCards.length - 1) {
			setPhase('exercise')
			setAnswer(defaultAnswer())
			return
		}

		setIntroIndex(introIndex + 1)
	}

	return (
		<div className="space-y-5">
			<div className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<Dialog open={quitDialogOpen} onOpenChange={setQuitDialogOpen}>
						<DialogTrigger asChild>
							<Button
								variant="ghost"
								className="rounded-full border border-slate-300 bg-white text-slate-950 shadow-sm hover:bg-slate-50 hover:text-black dark:border-white/10 dark:bg-white/10 dark:text-white/85 dark:hover:bg-white/15 dark:hover:text-white"
							>
								<X className="size-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-md rounded-[32px] border-slate-200 bg-white text-center text-slate-900 dark:border-white/10 dark:bg-[#13212a] dark:text-white">
							<DialogHeader className="items-center text-center">
								<div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-green-500 text-5xl shadow-[0_10px_30px_rgba(132,204,22,0.35)]">
									🦉
								</div>
								<DialogTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
									Wait, don&apos;t go!
								</DialogTitle>
								<DialogDescription className="max-w-sm text-base leading-7 text-slate-600 dark:text-white/75">
									You&apos;ll lose your current lesson progress if you quit now.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-3">
								<Button
									type="button"
									className="h-12 w-full rounded-2xl bg-sky-500 text-white hover:bg-sky-600"
									onClick={() => setQuitDialogOpen(false)}
								>
									Keep learning
								</Button>
								<Button
									asChild
									type="button"
									variant="ghost"
									className="h-12 w-full rounded-2xl text-rose-300 hover:bg-white/5 hover:text-rose-200"
								>
									<Link to="/">End session</Link>
								</Button>
							</div>
						</DialogContent>
					</Dialog>

					<div className="flex flex-1 items-center gap-3">
						<Progress value={progressValue} className="flex-1" />
						<p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">
							{activeLesson.title}
						</p>
					</div>

					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								className="rounded-full border border-slate-300 bg-white text-slate-950 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white/85 dark:hover:bg-white/15 dark:hover:text-white"
							>
								<Info className="size-4" />
							</Button>
						</SheetTrigger>
						<SheetContent>
							<SheetHeader>
								<SheetTitle>{activeLesson.title}</SheetTitle>
								<SheetDescription>{activeLesson.grammarNote}</SheetDescription>
							</SheetHeader>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{skipNotice ? (
				<Card className="border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10">
					<CardContent className="flex items-center justify-between gap-4 p-4">
						<p className="text-sm text-sky-800 dark:text-sky-100">
							{skipNotice}
						</p>
						<Button
							type="button"
							variant="ghost"
							className="h-9 rounded-xl text-sky-800 dark:text-sky-100"
							onClick={dismissSkipNotice}
						>
							Dismiss
						</Button>
					</CardContent>
				</Card>
			) : speakingSkipActive ? (
				<Card className="border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
					<CardContent className="p-4 text-sm text-slate-700 dark:text-white/70">
						Speaking tasks are being skipped until {speakingSkipUntilLabel}.
					</CardContent>
				</Card>
			) : null}

			{phase === 'intro' && activeIntroCard ? (
				<LessonIntroCard
					card={activeIntroCard}
					index={introIndex}
					total={activeLesson.introCards.length}
					onSpeak={appServices.voiceService.speak}
					onContinue={handleIntroContinue}
				/>
			) : (
				<ExerciseRenderer
					exercise={activeExercise!}
					answer={answer}
					onChange={setAnswer}
					onSpeak={appServices.voiceService.speak}
					onUseMic={handleUseMic}
					voiceCapability={voiceCapability}
					listening={listening}
					audioMeaning={activeAudioMeaning}
				/>
			)}

			{phase === 'exercise' && checkedResult ? (
				<Card
					className={
						checkedResult.correct
							? 'border-emerald-200 dark:border-emerald-500/30'
							: 'border-rose-200 dark:border-rose-500/30'
					}
				>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-lg">
							{checkedResult.correct ? (
								<CheckCircle2 className="size-5 text-emerald-500" />
							) : (
								<XCircle className="size-5 text-rose-500" />
							)}
							{checkedResult.correct ? 'Correct!' : 'Almost there'}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-slate-600 dark:text-white/70">
							{checkedResult.feedback}
						</p>
						{!checkedResult.correct ? (
							<div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
								Correct answer:{' '}
								{renderCorrectAnswer(checkedResult.correctAnswer)}
							</div>
						) : null}
						<Button
							className="h-12 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
							onClick={handleContinue}
						>
							{checkedResult.correct && queueIndex === exerciseQueue.length - 1
								? 'Finish lesson'
								: 'Continue'}
						</Button>
					</CardContent>
				</Card>
			) : phase === 'exercise' ? (
				<div className="grid grid-cols-2 gap-3">
					<Button
						type="button"
						variant="ghost"
						className="h-12 rounded-2xl border border-slate-300 bg-white text-slate-950 shadow-sm hover:bg-slate-50 hover:text-black dark:border-white/10 dark:bg-white/10 dark:text-white/85 dark:hover:bg-white/15 dark:hover:text-white"
						onClick={handleSkipExercise}
					>
						Skip
					</Button>
					<Button
						className={cn(
							'h-12 rounded-2xl bg-gradient-to-r text-white hover:opacity-95',
							activeLesson.color
						)}
						onClick={handleCheck}
						disabled={!isAnswerReady(answer, activeExercise)}
					>
						Check
					</Button>
				</div>
			) : null}
		</div>
	)
}
