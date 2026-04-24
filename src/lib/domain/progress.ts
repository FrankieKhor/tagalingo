import { achievementCatalog, curriculumUnits } from '@/content'
import { ensureQuestState, syncQuestProgress } from '@/lib/domain/quests'
import { mergeReviewItems } from '@/lib/domain/review-engine'
import type {
	AppSettings,
	ChestReward,
	ExerciseResult,
	LearnPathItemViewModel,
	LeaderboardCycle,
	LeaderboardEntry,
	LeaderboardOutcome,
	LeaderboardRowViewModel,
	LeaderboardState,
	LeaderboardTierViewModel,
	LeaderboardViewModel,
	LearnUnitViewModel,
	LeagueTier,
	Lesson,
	LessonPathNode,
	LessonProgress,
	ProgressSnapshot,
	ReviewItem,
	ShopItemId,
	Unit,
	UnitCategory,
	WeakWordStat,
} from '@/lib/domain/models'
import { differenceInDays, shiftISODate, toISODate } from '@/lib/utils/dates'

export const defaultSettings: AppSettings = {
	soundEnabled: true,
	speechPlaybackEnabled: true,
	microphoneEnabled: true,
	reducedMotion: false,
	theme: 'dark',
}

export const SPEAKING_SKIP_DURATION_MS = 15 * 60 * 1000
export const MAX_HEARTS = 5
export const LESSON_COMPLETION_POINTS = 10
const LEADERBOARD_CYCLE_MS = 7 * 24 * 60 * 60 * 1000
const LEADERBOARD_SIZE = 10

export const LEAGUE_ORDER: LeagueTier[] = [
	'bronze',
	'silver',
	'gold',
	'sapphire',
	'ruby',
	'emerald',
	'amethyst',
	'pearl',
	'obsidian',
	'diamond',
]

const LEAGUE_LABELS: Record<LeagueTier, string> = {
	bronze: 'Bronze',
	silver: 'Silver',
	gold: 'Gold',
	sapphire: 'Sapphire',
	ruby: 'Ruby',
	emerald: 'Emerald',
	amethyst: 'Amethyst',
	pearl: 'Pearl',
	obsidian: 'Obsidian',
	diamond: 'Diamond',
}

const LEAGUE_BOT_XP_RANGES: Record<LeagueTier, readonly [number, number]> = {
	bronze: [45, 130],
	silver: [80, 170],
	gold: [120, 230],
	sapphire: [170, 300],
	ruby: [220, 380],
	emerald: [280, 470],
	amethyst: [340, 570],
	pearl: [410, 690],
	obsidian: [500, 820],
	diamond: [620, 980],
}

const LEADERBOARD_BOT_IDENTITIES = [
	{ name: 'Maya', emoji: '🌙' },
	{ name: 'Rio', emoji: '⚡' },
	{ name: 'Tala', emoji: '⭐' },
	{ name: 'Nico', emoji: '🦊' },
	{ name: 'Ari', emoji: '🌿' },
	{ name: 'Luna', emoji: '🫧' },
	{ name: 'Sora', emoji: '🎈' },
	{ name: 'Pia', emoji: '🍓' },
	{ name: 'Theo', emoji: '🛹' },
	{ name: 'Kiko', emoji: '🐯' },
	{ name: 'Naya', emoji: '🌼' },
	{ name: 'Milo', emoji: '🎧' },
	{ name: 'Asha', emoji: '💫' },
	{ name: 'Juno', emoji: '🦉' },
	{ name: 'Enzo', emoji: '🔥' },
	{ name: 'Lia', emoji: '🎀' },
] as const

const PATH_CHEST_REWARDS = {
	xp: [25, 35, 45],
	points: [18, 24, 30],
	hearts: 2,
} as const

const DAILY_CHEST_REWARDS = {
	xp: [10, 15, 20],
	points: [6, 8, 10],
	hearts: 1,
} as const

const CHEST_REWARD_WEIGHTS = {
	xp: 6,
	points: 3,
	hearts: 1,
} as const

function hashString(value: string) {
	return Array.from(value).reduce((total, character, index) => {
		return total + character.charCodeAt(0) * (index + 11)
	}, 0)
}

function createSeededRng(seed: number) {
	let value = seed % 2147483647

	if (value <= 0) {
		value += 2147483646
	}

	return () => {
		value = (value * 16807) % 2147483647
		return (value - 1) / 2147483646
	}
}

function getLeagueIndex(league: LeagueTier) {
	return LEAGUE_ORDER.indexOf(league)
}

function clampLeagueIndex(index: number) {
	return Math.max(0, Math.min(LEAGUE_ORDER.length - 1, index))
}

function getLeagueLabel(league: LeagueTier) {
	return LEAGUE_LABELS[league]
}

function moveLeague(league: LeagueTier, delta: number) {
	return (
		LEAGUE_ORDER[clampLeagueIndex(getLeagueIndex(league) + delta)] ?? league
	)
}

function sortLeaderboardEntries(entries: LeaderboardEntry[]) {
	return [...entries].sort((left, right) => {
		if (right.weeklyXp !== left.weeklyXp) {
			return right.weeklyXp - left.weeklyXp
		}

		if (left.isBot !== right.isBot) {
			return Number(left.isBot) - Number(right.isBot)
		}

		return left.id.localeCompare(right.id)
	})
}

function getBotPaceExponent(entryId: string) {
	return 0.72 + (hashString(entryId) % 61) / 100
}

function getCycleElapsedRatio(cycle: LeaderboardCycle, now = new Date()) {
	const start = new Date(cycle.startedAt).getTime()
	const end = new Date(cycle.endsAt).getTime()
	const duration = Math.max(1, end - start)
	const elapsed = Math.max(0, Math.min(duration, now.getTime() - start))

	return elapsed / duration
}

function getDisplayedWeeklyXp(
	entry: LeaderboardEntry,
	cycle: LeaderboardCycle,
	now = new Date()
) {
	if (!entry.isBot) {
		return entry.weeklyXp
	}

	const ratio = getCycleElapsedRatio(cycle, now)
	const exponent = getBotPaceExponent(entry.id)
	return Math.round(entry.weeklyXp * Math.pow(ratio, exponent))
}

function createPlayerLeaderboardEntry(
	snapshot: ProgressSnapshot,
	weeklyXp = 0
): LeaderboardEntry {
	return {
		id: snapshot.profile.id,
		displayName: snapshot.profile.displayName,
		avatarEmoji: snapshot.profile.avatarEmoji,
		isBot: false,
		weeklyXp,
	}
}

function createLeaderboardBots(league: LeagueTier, seedKey: string) {
	const rng = createSeededRng(hashString(seedKey))
	const [minXp, maxXp] = LEAGUE_BOT_XP_RANGES[league]
	const identities = [...LEADERBOARD_BOT_IDENTITIES]
	const bots: LeaderboardEntry[] = []

	for (let index = identities.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(rng() * (index + 1))
		;[identities[index], identities[randomIndex]] = [
			identities[randomIndex],
			identities[index],
		]
	}

	for (let index = 0; index < LEADERBOARD_SIZE - 1; index += 1) {
		const identity = identities[index % identities.length]
		bots.push({
			id: `bot-${index + 1}-${hashString(`${seedKey}-${index}`)}`,
			displayName: identity.name,
			avatarEmoji: identity.emoji,
			isBot: true,
			weeklyXp: Math.round(minXp + (maxXp - minXp) * rng()),
		})
	}

	return bots
}

function createLeaderboardState(): LeaderboardState {
	return {
		currentLeague: 'bronze',
	}
}

function createLeaderboardCycle(
	snapshot: ProgressSnapshot,
	xpGain: number,
	now = new Date()
): LeaderboardCycle {
	const startedAt = now.toISOString()
	const endsAt = new Date(now.getTime() + LEADERBOARD_CYCLE_MS).toISOString()
	const seedKey = `${snapshot.leaderboard.currentLeague}:${startedAt}:${snapshot.profile.id}`
	const playerEntry = createPlayerLeaderboardEntry(snapshot, xpGain)

	return {
		league: snapshot.leaderboard.currentLeague,
		startedAt,
		endsAt,
		joined: true,
		playerWeeklyXp: xpGain,
		entries: [
			...createLeaderboardBots(snapshot.leaderboard.currentLeague, seedKey),
			playerEntry,
		],
	}
}

function updateLeaderboardCyclePlayerXp(
	cycle: LeaderboardCycle,
	snapshot: ProgressSnapshot,
	xpGain: number
) {
	const playerWeeklyXp = cycle.playerWeeklyXp + xpGain

	return {
		...cycle,
		playerWeeklyXp,
		entries: cycle.entries.map((entry) =>
			entry.isBot
				? entry
				: {
						...entry,
						displayName: snapshot.profile.displayName,
						avatarEmoji: snapshot.profile.avatarEmoji,
						weeklyXp: playerWeeklyXp,
					}
		),
	}
}

function resolveLeaderboardOutcome(cycle: LeaderboardCycle, now = new Date()) {
	const ranked = sortLeaderboardEntries(cycle.entries)
	const placement = ranked.findIndex((entry) => !entry.isBot) + 1
	const outcome: LeaderboardOutcome =
		placement > 0 && placement <= 3
			? 'promoted'
			: placement > ranked.length - 3
				? 'demoted'
				: 'stayed'
	const currentLeague =
		outcome === 'promoted'
			? moveLeague(cycle.league, 1)
			: outcome === 'demoted'
				? moveLeague(cycle.league, -1)
				: cycle.league

	return {
		currentLeague,
		result: {
			finishedLeague: cycle.league,
			placement,
			outcome:
				(outcome === 'demoted' && cycle.league === currentLeague) ||
				(outcome === 'promoted' && cycle.league === currentLeague)
					? 'stayed'
					: outcome,
			resolvedAt: now.toISOString(),
		},
	}
}

function resolveExpiredLeaderboardCycle(
	snapshot: ProgressSnapshot,
	now = new Date()
) {
	const cycle = snapshot.leaderboard.currentCycle

	if (!cycle || new Date(cycle.endsAt).getTime() > now.getTime()) {
		return snapshot
	}

	const resolution = resolveLeaderboardOutcome(cycle, now)

	return {
		...snapshot,
		leaderboard: {
			currentLeague: resolution.currentLeague,
			lastResult: resolution.result,
		},
	}
}

function applyLeaderboardXp(
	snapshot: ProgressSnapshot,
	xpGain: number,
	now = new Date()
): ProgressSnapshot {
	const resolvedSnapshot = resolveExpiredLeaderboardCycle(snapshot, now)

	if (xpGain <= 0) {
		return resolvedSnapshot
	}

	const currentCycle = resolvedSnapshot.leaderboard.currentCycle

	return {
		...resolvedSnapshot,
		leaderboard: {
			...resolvedSnapshot.leaderboard,
			currentCycle: currentCycle
				? updateLeaderboardCyclePlayerXp(currentCycle, resolvedSnapshot, xpGain)
				: createLeaderboardCycle(resolvedSnapshot, xpGain, now),
		},
	}
}

function buildLeaderboardResultView(result: LeaderboardState['lastResult']) {
	if (!result) {
		return undefined
	}

	const finishedLeagueLabel = getLeagueLabel(result.finishedLeague)
	const title =
		result.outcome === 'promoted'
			? `Promoted to ${getLeagueLabel(moveLeague(result.finishedLeague, 1))}`
			: result.outcome === 'demoted'
				? `Dropped to ${getLeagueLabel(moveLeague(result.finishedLeague, -1))}`
				: `Held your ${finishedLeagueLabel} spot`
	const description =
		result.outcome === 'promoted'
			? `You finished #${result.placement} in ${finishedLeagueLabel} and moved up a league.`
			: result.outcome === 'demoted'
				? `You finished #${result.placement} in ${finishedLeagueLabel} and moved down a league.`
				: `You finished #${result.placement} in ${finishedLeagueLabel} and stayed put for the next cycle.`

	return {
		finishedLeague: result.finishedLeague,
		finishedLeagueLabel,
		placement: result.placement,
		outcome: result.outcome,
		title,
		description,
	}
}

function formatLeaderboardTimeRemaining(endsAt: string, now = new Date()) {
	const remainingMs = Math.max(0, new Date(endsAt).getTime() - now.getTime())
	const totalMinutes = Math.ceil(remainingMs / (60 * 1000))
	const days = Math.floor(totalMinutes / (60 * 24))
	const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
	const minutes = totalMinutes % 60

	if (days > 0) {
		return `${days}d ${hours}h left`
	}

	if (hours > 0) {
		return `${hours}h ${minutes}m left`
	}

	return `${Math.max(1, minutes)}m left`
}

export function createInitialSnapshot(): ProgressSnapshot {
	const firstLesson = curriculumUnits[0]?.categories[0]?.lessons[0]
	const today = toISODate()

	return ensureQuestState(
		{
			profile: {
				id: 'guest',
				displayName: 'Local Learner',
				avatarEmoji: '🐣',
				xp: 0,
				points: 0,
				hearts: MAX_HEARTS,
				streak: 0,
				totalLessonsCompleted: 0,
				totalReviewsCompleted: 0,
				achievements: [],
				dailyGoal: {
					xpTarget: 20,
					currentXp: 0,
				},
			},
			lessonProgress: {},
			currentLessonId: firstLesson?.id,
			speakingSkipUntil: undefined,
			reviewQueue: [],
			weakWords: [],
			settings: defaultSettings,
			speakingAttempts: [],
			dailyStats: {
				lessonSessionsCompleted: 0,
				reviewCardsCompleted: 0,
				bestLessonScore: 0,
				bestCorrectStreak: 0,
			},
			quests: [],
			inventory: {},
			equippedPowerUps: [],
			lastQuestRefreshOn: today,
			openedPathChestIds: [],
			lastDailyChestOpenedOn: undefined,
			leaderboard: createLeaderboardState(),
		},
		today
	)
}

function getStreakFreezeState(
	snapshot: ProgressSnapshot,
	today: string,
	dayDiff: number
) {
	const streakFreezeArmed = snapshot.equippedPowerUps.includes('streak-freeze')

	if (!streakFreezeArmed || dayDiff !== 2) {
		return {
			streak: 0,
			lastActiveOn: snapshot.profile.lastActiveOn,
			equippedPowerUps: snapshot.equippedPowerUps,
		}
	}

	return {
		streak: snapshot.profile.streak,
		lastActiveOn: shiftISODate(today, -1),
		equippedPowerUps: snapshot.equippedPowerUps.filter(
			(itemId) => itemId !== 'streak-freeze'
		),
	}
}

export function hydrateDailyState(
	snapshot: ProgressSnapshot
): ProgressSnapshot {
	const today = toISODate()
	const lastActive = snapshot.profile.lastActiveOn
	const needsQuestRefresh = snapshot.lastQuestRefreshOn !== today
	const questReadySnapshot = ensureQuestState(
		resolveExpiredLeaderboardCycle(snapshot),
		today
	)

	if (!lastActive) {
		return questReadySnapshot
	}

	const dayDiff = differenceInDays(today, lastActive)

	if (dayDiff <= 0 && !needsQuestRefresh) {
		return syncQuestProgress(questReadySnapshot)
	}

	const streakState =
		dayDiff <= 0
			? {
					streak: questReadySnapshot.profile.streak,
					lastActiveOn: questReadySnapshot.profile.lastActiveOn,
					equippedPowerUps: questReadySnapshot.equippedPowerUps,
				}
			: dayDiff === 1
				? {
						streak: questReadySnapshot.profile.streak,
						lastActiveOn: questReadySnapshot.profile.lastActiveOn,
						equippedPowerUps: questReadySnapshot.equippedPowerUps,
					}
				: getStreakFreezeState(questReadySnapshot, today, dayDiff)

	return syncQuestProgress({
		...questReadySnapshot,
		equippedPowerUps: streakState.equippedPowerUps,
		dailyStats: needsQuestRefresh
			? {
					lessonSessionsCompleted: 0,
					reviewCardsCompleted: 0,
					bestLessonScore: 0,
					bestCorrectStreak: 0,
				}
			: questReadySnapshot.dailyStats,
		profile: {
			...questReadySnapshot.profile,
			hearts: dayDiff > 0 ? MAX_HEARTS : questReadySnapshot.profile.hearts,
			streak:
				dayDiff > 1 ? streakState.streak : questReadySnapshot.profile.streak,
			lastActiveOn: streakState.lastActiveOn,
			dailyGoal: {
				...questReadySnapshot.profile.dailyGoal,
				currentXp:
					dayDiff > 0 ? 0 : questReadySnapshot.profile.dailyGoal.currentXp,
			},
		},
	})
}

function updateWeakWords(
	current: WeakWordStat[],
	words: string[]
): WeakWordStat[] {
	const map = new Map(current.map((entry) => [entry.term, entry]))
	const now = new Date().toISOString()

	words.forEach((word) => {
		const existing = map.get(word)
		map.set(word, {
			term: word,
			mistakes: (existing?.mistakes ?? 0) + 1,
			lastSeenAt: now,
		})
	})

	return Array.from(map.values()).sort((a, b) => b.mistakes - a.mistakes)
}

function awardAchievements(snapshot: ProgressSnapshot): string[] {
	return achievementCatalog
		.filter((achievement) => {
			switch (achievement.requirement) {
				case 'xp':
					return snapshot.profile.xp >= achievement.target
				case 'lessons':
					return snapshot.profile.totalLessonsCompleted >= achievement.target
				case 'streak':
					return snapshot.profile.streak >= achievement.target
				case 'reviews':
					return snapshot.profile.totalReviewsCompleted >= achievement.target
			}
		})
		.map((achievement) => achievement.id)
}

function getUnitChestId(unitId: string) {
	return `${unitId}-trail-chest`
}

function getLegacyChestIdsForUnit(unit: Unit) {
	return unit.categories
		.filter((category) => category.hasRewardChest)
		.map((category) => `${category.id}-reward`)
}

function isChestAlreadyOpened(snapshot: ProgressSnapshot, chestId: string) {
	if (snapshot.openedPathChestIds.includes(chestId)) {
		return true
	}

	const unit = curriculumUnits.find(
		(entry) => getUnitChestId(entry.id) === chestId
	)

	if (!unit) {
		return false
	}

	return getLegacyChestIdsForUnit(unit).some((legacyId) =>
		snapshot.openedPathChestIds.includes(legacyId)
	)
}

function getUnitChestPlacement(unit: Unit) {
	const lessons = unit.categories.flatMap((category) => category.lessons)
	const minAfterLessons = lessons.length <= 3 ? 1 : 2
	const maxAfterLessons = Math.max(minAfterLessons, lessons.length - 2)
	const afterLessonCount =
		minAfterLessons +
		(hashString(unit.id) % (maxAfterLessons - minAfterLessons + 1))

	return {
		chestId: getUnitChestId(unit.id),
		afterLessonCount,
	}
}

function getUnitByChestId(chestId: string) {
	return curriculumUnits.find((unit) => getUnitChestId(unit.id) === chestId)
}

export function getPathChestState(
	snapshot: ProgressSnapshot,
	chestId: string
): 'locked' | 'ready' | 'opened' {
	if (isChestAlreadyOpened(snapshot, chestId)) {
		return 'opened'
	}

	const unit = getUnitByChestId(chestId)

	if (!unit) {
		return 'locked'
	}

	const { afterLessonCount } = getUnitChestPlacement(unit)
	const completedLessonsInUnit = unit.categories
		.flatMap((category) => category.lessons)
		.filter(
			(lesson) => snapshot.lessonProgress[lesson.id]?.status === 'completed'
		).length

	if (completedLessonsInUnit < afterLessonCount) {
		return 'locked'
	}

	return 'ready'
}

export function getDailyChestState(
	snapshot: ProgressSnapshot,
	today = toISODate()
) {
	if (snapshot.lastDailyChestOpenedOn === today) {
		return 'opened' as const
	}

	if (
		snapshot.dailyStats.lessonSessionsCompleted > 0 ||
		snapshot.dailyStats.reviewCardsCompleted > 0
	) {
		return 'ready' as const
	}

	return 'locked' as const
}

function pickWeightedRewardType(
	availableTypes: Array<ChestReward['rewardType']>,
	randomValue: number
) {
	const totalWeight = availableTypes.reduce(
		(sum, rewardType) => sum + CHEST_REWARD_WEIGHTS[rewardType],
		0
	)
	let cursor = randomValue * totalWeight

	for (const rewardType of availableTypes) {
		cursor -= CHEST_REWARD_WEIGHTS[rewardType]

		if (cursor <= 0) {
			return rewardType
		}
	}

	return availableTypes[availableTypes.length - 1]
}

function pickArrayReward(values: readonly number[], randomValue: number) {
	return values[Math.floor(randomValue * values.length)] ?? values[0]
}

function rollChestReward(
	snapshot: ProgressSnapshot,
	source: ChestReward['source'],
	chestId?: string,
	rng = Math.random
): ChestReward {
	const rewardTable =
		source === 'path' ? PATH_CHEST_REWARDS : DAILY_CHEST_REWARDS
	const availableTypes: Array<ChestReward['rewardType']> =
		snapshot.profile.hearts >= MAX_HEARTS
			? ['xp', 'points']
			: ['xp', 'points', 'hearts']
	const rewardType = pickWeightedRewardType(availableTypes, rng())
	const amount =
		rewardType === 'xp'
			? pickArrayReward(rewardTable.xp, rng())
			: rewardType === 'points'
				? pickArrayReward(rewardTable.points, rng())
				: rewardTable.hearts

	return {
		chestId,
		source,
		rewardType,
		amount,
	}
}

function applyChestReward(snapshot: ProgressSnapshot, reward: ChestReward) {
	const xpGain = reward.rewardType === 'xp' ? reward.amount : 0
	const updated = syncQuestProgress(
		applyLeaderboardXp(
			{
				...snapshot,
				profile: {
					...snapshot.profile,
					xp: snapshot.profile.xp + xpGain,
					points:
						snapshot.profile.points +
						(reward.rewardType === 'points' ? reward.amount : 0),
					hearts:
						reward.rewardType === 'hearts'
							? Math.min(MAX_HEARTS, snapshot.profile.hearts + reward.amount)
							: snapshot.profile.hearts,
					dailyGoal: {
						...snapshot.profile.dailyGoal,
						currentXp: snapshot.profile.dailyGoal.currentXp + xpGain,
					},
					achievements: snapshot.profile.achievements,
				},
			},
			xpGain
		)
	)

	return {
		...updated,
		profile: {
			...updated.profile,
			achievements: awardAchievements(updated),
		},
	}
}

export function buildLessonPath(snapshot: ProgressSnapshot): LessonPathNode[] {
	const flattened = curriculumUnits.flatMap((unit) =>
		unit.categories.flatMap((category) =>
			category.lessons.map((lesson) => ({ lesson, unit, category }))
		)
	)

	let currentAssigned = false

	return flattened.map(({ lesson, unit, category }, index) => {
		const previousLesson = flattened[index - 1]?.lesson
		const completed = snapshot.lessonProgress[lesson.id]?.status === 'completed'
		const unlocked =
			index === 0 ||
			(!!previousLesson &&
				snapshot.lessonProgress[previousLesson.id]?.status === 'completed')
		const isCurrent =
			!completed &&
			unlocked &&
			(!currentAssigned || snapshot.currentLessonId === lesson.id)

		if (isCurrent) {
			currentAssigned = true
		}

		return { lesson, unit, category, unlocked, completed, isCurrent }
	})
}

function createUnitItems(
	snapshot: ProgressSnapshot,
	unit: Unit,
	categories: UnitCategory[],
	nodes: LessonPathNode[]
): LearnPathItemViewModel[] {
	const items: LearnPathItemViewModel[] = []

	categories.forEach((category) => {
		items.push({
			id: `${category.id}-label`,
			unit,
			category,
			nodeType: 'category-label',
			label: category.title,
			subtitle: category.subtitle,
		})

		if (category.hasGuidebook) {
			items.push({
				id: `${category.id}-guidebook`,
				unit,
				category,
				nodeType: 'guidebook',
				label: 'Guidebook',
			})
		}

		nodes
			.filter((node) => node.category.id === category.id)
			.forEach((node) => {
				items.push({
					id: node.lesson.id,
					unit,
					category,
					lesson: node.lesson,
					nodeType: 'lesson',
					state: node.completed
						? 'completed'
						: node.isCurrent
							? 'current'
							: node.unlocked
								? 'available'
								: 'locked',
					ctaLabel: node.completed
						? 'Practice'
						: node.isCurrent
							? 'Start'
							: 'Locked',
				})
			})
	})

	const unitLessons = nodes.map((node) => node.lesson)
	const rewardedCategory =
		categories.find((category) => category.hasRewardChest) ??
		categories[categories.length - 1]

	if (unitLessons.length > 0 && rewardedCategory) {
		const { chestId, afterLessonCount } = getUnitChestPlacement(unit)
		const anchorLesson =
			unitLessons[Math.min(afterLessonCount - 1, unitLessons.length - 1)]
		const anchorIndex = items.findIndex(
			(item) => item.nodeType === 'lesson' && item.lesson.id === anchorLesson.id
		)

		items.splice(anchorIndex + 1, 0, {
			id: chestId,
			unit,
			category: rewardedCategory,
			nodeType: 'reward',
			label: 'Chest',
			chestState: getPathChestState(snapshot, chestId),
		})
	}

	return items
}

export function buildLearnUnits(
	snapshot: ProgressSnapshot
): LearnUnitViewModel[] {
	const nodes = buildLessonPath(snapshot)

	return curriculumUnits.map((unit) => ({
		unit,
		items: createUnitItems(
			snapshot,
			unit,
			unit.categories,
			nodes.filter((node) => node.unit.id === unit.id)
		),
	}))
}

function buildLeaderboardTiers(
	currentLeague: LeagueTier
): LeaderboardTierViewModel[] {
	const currentLeagueIndex = getLeagueIndex(currentLeague)

	return LEAGUE_ORDER.map((league, index) => ({
		id: league,
		label: getLeagueLabel(league),
		locked: index > currentLeagueIndex,
		active: league === currentLeague,
	}))
}

export function buildLeaderboardView(
	snapshot: ProgressSnapshot,
	now = new Date()
): LeaderboardViewModel {
	const resolvedSnapshot = resolveExpiredLeaderboardCycle(snapshot, now)
	const currentLeague = resolvedSnapshot.leaderboard.currentLeague
	const cycle = resolvedSnapshot.leaderboard.currentCycle
	const joined = Boolean(cycle?.joined)
	const activeCycle =
		cycle && new Date(cycle.endsAt).getTime() > now.getTime()
			? cycle
			: undefined

	let rows: LeaderboardRowViewModel[] = []
	let promotionZoneIds: string[] = []
	let demotionZoneIds: string[] = []
	let playerRow: LeaderboardRowViewModel | undefined

	if (activeCycle) {
		const rankedEntries = sortLeaderboardEntries(
			activeCycle.entries.map((entry) => ({
				...entry,
				weeklyXp: getDisplayedWeeklyXp(entry, activeCycle, now),
			}))
		)

		promotionZoneIds = rankedEntries.slice(0, 3).map((entry) => entry.id)
		demotionZoneIds = rankedEntries.slice(-3).map((entry) => entry.id)
		rows = rankedEntries.map((entry, index) => ({
			id: entry.id,
			rank: index + 1,
			displayName: entry.displayName,
			avatarEmoji: entry.avatarEmoji,
			isBot: entry.isBot,
			isPlayer: !entry.isBot,
			weeklyXp: entry.weeklyXp,
			promotionZone: promotionZoneIds.includes(entry.id),
			demotionZone: demotionZoneIds.includes(entry.id),
		}))
		playerRow = rows.find((entry) => entry.isPlayer)
	}

	return {
		currentLeague,
		currentLeagueLabel: getLeagueLabel(currentLeague),
		joined,
		hasActiveCycle: Boolean(activeCycle),
		tiers: buildLeaderboardTiers(currentLeague),
		rows,
		playerRow,
		promotionZoneIds,
		demotionZoneIds,
		cycleStartedAt: activeCycle?.startedAt,
		cycleEndsAt: activeCycle?.endsAt,
		timeRemainingLabel: activeCycle
			? formatLeaderboardTimeRemaining(activeCycle.endsAt, now)
			: undefined,
		cycleProgress: activeCycle ? getCycleElapsedRatio(activeCycle, now) : 0,
		lastResult: buildLeaderboardResultView(
			resolvedSnapshot.leaderboard.lastResult
		),
	}
}

export function isSpeakingSkipActive(
	snapshot: Pick<ProgressSnapshot, 'speakingSkipUntil'>,
	now = new Date()
) {
	if (!snapshot.speakingSkipUntil) {
		return false
	}

	return new Date(snapshot.speakingSkipUntil).getTime() > now.getTime()
}

export function createSpeakingSkipUntil(now = new Date()) {
	return new Date(now.getTime() + SPEAKING_SKIP_DURATION_MS).toISOString()
}

export function updateSpeakingSkipUntil(
	snapshot: ProgressSnapshot,
	speakingSkipUntil?: string
): ProgressSnapshot {
	return {
		...snapshot,
		speakingSkipUntil,
	}
}

function getLatestExerciseResults(results: ExerciseResult[]) {
	const latestResults = new Map<string, ExerciseResult>()

	results.forEach((result) => {
		latestResults.set(result.exerciseId, result)
	})

	return Array.from(latestResults.values())
}

function getBestCorrectStreak(results: ExerciseResult[]) {
	let best = 0
	let current = 0

	results.forEach((result) => {
		if (result.correct) {
			current += 1
			best = Math.max(best, current)
			return
		}

		current = 0
	})

	return best
}

export function applyLessonSummary(
	snapshot: ProgressSnapshot,
	lesson: Lesson,
	results: ExerciseResult[]
): ProgressSnapshot {
	const latestResults = getLatestExerciseResults(results)
	const today = toISODate()
	const score = Math.round(
		(latestResults.filter((result) => result.correct).length /
			lesson.exercises.length) *
			100
	)
	const totalXp = results.reduce((sum, result) => sum + result.earnedXp, 0)
	const heartsLost = results.reduce(
		(sum, result) => sum + Math.abs(Math.min(result.heartsDelta, 0)),
		0
	)
	const previousStatus = snapshot.lessonProgress[lesson.id]?.status
	const currentStreak =
		snapshot.profile.lastActiveOn &&
		differenceInDays(today, snapshot.profile.lastActiveOn) === 1
			? snapshot.profile.streak + 1
			: snapshot.profile.lastActiveOn === today
				? snapshot.profile.streak
				: 1

	const nextLessonProgress: LessonProgress = {
		lessonId: lesson.id,
		status: score >= 70 ? 'completed' : 'in-progress',
		bestScore: Math.max(
			snapshot.lessonProgress[lesson.id]?.bestScore ?? 0,
			score
		),
		attempts: (snapshot.lessonProgress[lesson.id]?.attempts ?? 0) + 1,
		completedAt: score >= 70 ? new Date().toISOString() : undefined,
	}

	const allLessons = curriculumUnits.flatMap((unit) =>
		unit.categories.flatMap((category) => category.lessons)
	)
	const currentIndex = allLessons.findIndex((item) => item.id === lesson.id)
	const nextLessonId =
		score >= 70 ? allLessons[currentIndex + 1]?.id : lesson.id
	const earnedLessonPoints = score >= 70 ? LESSON_COMPLETION_POINTS : 0

	const updated = syncQuestProgress(
		applyLeaderboardXp(
			{
				...snapshot,
				currentLessonId: nextLessonId,
				lessonProgress: {
					...snapshot.lessonProgress,
					[lesson.id]: nextLessonProgress,
				},
				reviewQueue: mergeReviewItems(
					snapshot.reviewQueue,
					results.flatMap((result) => result.reviewItems)
				),
				weakWords: updateWeakWords(
					snapshot.weakWords,
					results.flatMap((result) => result.weakWords)
				),
				speakingAttempts: [
					...snapshot.speakingAttempts,
					...results.flatMap((result) =>
						result.speakingAttempt ? [result.speakingAttempt] : []
					),
				],
				dailyStats: {
					lessonSessionsCompleted:
						snapshot.dailyStats.lessonSessionsCompleted + 1,
					reviewCardsCompleted: snapshot.dailyStats.reviewCardsCompleted,
					bestLessonScore: Math.max(snapshot.dailyStats.bestLessonScore, score),
					bestCorrectStreak: Math.max(
						snapshot.dailyStats.bestCorrectStreak,
						getBestCorrectStreak(results)
					),
				},
				profile: {
					...snapshot.profile,
					xp: snapshot.profile.xp + totalXp,
					points: snapshot.profile.points + earnedLessonPoints,
					hearts: Math.max(0, snapshot.profile.hearts - heartsLost),
					streak: currentStreak,
					lastActiveOn: today,
					totalLessonsCompleted:
						snapshot.profile.totalLessonsCompleted +
						(score >= 70 && previousStatus !== 'completed' ? 1 : 0),
					dailyGoal: {
						...snapshot.profile.dailyGoal,
						currentXp: snapshot.profile.dailyGoal.currentXp + totalXp,
					},
					achievements: snapshot.profile.achievements,
				},
			},
			totalXp
		)
	)

	const achievements = awardAchievements(updated)

	return {
		...updated,
		profile: {
			...updated.profile,
			achievements: achievements.filter(
				(id, index, arr) => arr.indexOf(id) === index
			),
		},
	}
}

export function applyReviewResult(
	snapshot: ProgressSnapshot,
	updatedQueue: ReviewItem[],
	correct: boolean
): ProgressSnapshot {
	const xpGain = correct ? 4 : 1
	const nextSnapshot = syncQuestProgress(
		applyLeaderboardXp(
			{
				...snapshot,
				reviewQueue: updatedQueue,
				dailyStats: {
					...snapshot.dailyStats,
					reviewCardsCompleted: snapshot.dailyStats.reviewCardsCompleted + 1,
				},
				profile: {
					...snapshot.profile,
					xp: snapshot.profile.xp + xpGain,
					totalReviewsCompleted: snapshot.profile.totalReviewsCompleted + 1,
					dailyGoal: {
						...snapshot.profile.dailyGoal,
						currentXp: snapshot.profile.dailyGoal.currentXp + xpGain,
					},
					lastActiveOn: toISODate(),
				},
			},
			xpGain
		)
	)

	return {
		...nextSnapshot,
		profile: {
			...nextSnapshot.profile,
			achievements: awardAchievements(nextSnapshot),
		},
	}
}

function decrementInventory(
	inventory: ProgressSnapshot['inventory'],
	itemId: ShopItemId
): ProgressSnapshot['inventory'] {
	const nextValue = Math.max(0, (inventory[itemId] ?? 0) - 1)

	if (nextValue === 0) {
		const { [itemId]: removedItem, ...rest } = inventory
		void removedItem
		return rest
	}

	return {
		...inventory,
		[itemId]: nextValue,
	}
}

export function buyInventoryItem(
	snapshot: ProgressSnapshot,
	itemId: ShopItemId,
	cost: number
): ProgressSnapshot {
	if (snapshot.profile.points < cost) {
		return snapshot
	}

	return {
		...snapshot,
		profile: {
			...snapshot.profile,
			points: snapshot.profile.points - cost,
		},
		inventory: {
			...snapshot.inventory,
			[itemId]: (snapshot.inventory[itemId] ?? 0) + 1,
		},
	}
}

export function useInventoryItem(
	snapshot: ProgressSnapshot,
	itemId: Extract<ShopItemId, 'heart-refill' | 'heart-snack'>
): ProgressSnapshot {
	if (
		(snapshot.inventory[itemId] ?? 0) <= 0 ||
		snapshot.profile.hearts >= MAX_HEARTS
	) {
		return snapshot
	}

	const heartsRestored =
		itemId === 'heart-refill'
			? MAX_HEARTS
			: Math.min(MAX_HEARTS, snapshot.profile.hearts + 2)

	return {
		...snapshot,
		inventory: decrementInventory(snapshot.inventory, itemId),
		profile: {
			...snapshot.profile,
			hearts: heartsRestored,
		},
	}
}

export function togglePowerUpEquip(
	snapshot: ProgressSnapshot,
	itemId: Extract<ShopItemId, 'streak-freeze'>
): ProgressSnapshot {
	const isEquipped = snapshot.equippedPowerUps.includes(itemId)

	if (isEquipped) {
		return {
			...snapshot,
			equippedPowerUps: snapshot.equippedPowerUps.filter(
				(entry) => entry !== itemId
			),
			inventory: {
				...snapshot.inventory,
				[itemId]: (snapshot.inventory[itemId] ?? 0) + 1,
			},
		}
	}

	if ((snapshot.inventory[itemId] ?? 0) <= 0) {
		return snapshot
	}

	return {
		...snapshot,
		inventory: decrementInventory(snapshot.inventory, itemId),
		equippedPowerUps: [...snapshot.equippedPowerUps, itemId],
	}
}

export function openPathChest(
	snapshot: ProgressSnapshot,
	chestId: string,
	rng = Math.random
) {
	if (getPathChestState(snapshot, chestId) !== 'ready') {
		return { snapshot, reward: null as ChestReward | null }
	}

	const reward = rollChestReward(snapshot, 'path', chestId, rng)
	const rewardedSnapshot = applyChestReward(snapshot, reward)

	return {
		snapshot: {
			...rewardedSnapshot,
			openedPathChestIds: [...rewardedSnapshot.openedPathChestIds, chestId],
		},
		reward,
	}
}

export function openDailyChest(snapshot: ProgressSnapshot, rng = Math.random) {
	const today = toISODate()

	if (getDailyChestState(snapshot, today) !== 'ready') {
		return { snapshot, reward: null as ChestReward | null }
	}

	const reward = rollChestReward(snapshot, 'daily', undefined, rng)
	const rewardedSnapshot = applyChestReward(snapshot, reward)

	return {
		snapshot: {
			...rewardedSnapshot,
			lastDailyChestOpenedOn: today,
		},
		reward,
	}
}
