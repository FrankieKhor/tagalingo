import { create } from 'zustand'

import type { AuthUser } from '@/lib/firebase/auth'
import { buildLeaderboardView } from '@/lib/domain/progress'
import { createInitialSnapshot } from '@/lib/domain/progress'
import { appServices } from '@/lib/services/app-services'
import type {
	AppSettings,
	ChestReward,
	ExerciseResult,
	LeaderboardViewModel,
	Lesson,
	ProgressSnapshot,
	ShopItemId,
	VoiceCapability,
} from '@/lib/domain/models'

type SnapshotDerivedState = {
	snapshot: ProgressSnapshot
	units: ReturnType<typeof appServices.lessonService.getUnits>
	path: ReturnType<typeof appServices.lessonService.getPath>
	learnUnits: ReturnType<typeof appServices.lessonService.getLearnUnits>
	leaderboardView: LeaderboardViewModel
	voiceCapability: VoiceCapability
}

type AppState = SnapshotDerivedState & {
	initialized: boolean
	loading: boolean
	saving: boolean
	error?: string
	initialize: (user?: AuthUser | null) => Promise<void>
	getLesson: (lessonId: string) => Lesson | undefined
	completeLesson: (
		lesson: Lesson,
		results: ExerciseResult[]
	) => Promise<ProgressSnapshot>
	setSpeakingSkipUntil: (
		speakingSkipUntil?: string
	) => Promise<ProgressSnapshot>
	submitReview: (
		reviewId: string,
		correct: boolean
	) => Promise<ProgressSnapshot>
	updateSettings: (settings: AppSettings) => Promise<ProgressSnapshot>
	claimQuest: (questId: string) => Promise<ProgressSnapshot>
	buyShopItem: (itemId: ShopItemId) => Promise<ProgressSnapshot>
	useShopItem: (
		itemId: Extract<ShopItemId, 'heart-refill' | 'heart-snack'>
	) => Promise<ProgressSnapshot>
	toggleEquippedItem: (
		itemId: Extract<ShopItemId, 'streak-freeze'>
	) => Promise<ProgressSnapshot>
	openPathChest: (chestId: string) => Promise<ChestReward | null>
	openDailyChest: () => Promise<ChestReward | null>
	resetProgress: () => Promise<void>
}

function deriveSnapshotState(snapshot: ProgressSnapshot): SnapshotDerivedState {
	return {
		snapshot,
		units: appServices.lessonService.getUnits(),
		path: appServices.lessonService.getPath(snapshot),
		learnUnits: appServices.lessonService.getLearnUnits(snapshot),
		leaderboardView: buildLeaderboardView(snapshot),
		voiceCapability: appServices.voiceService.getCapability(),
	}
}

const initialSnapshot = createInitialSnapshot()

async function runSnapshotMutation(
	set: (partial: Partial<AppState>) => void,
	mutation: () => Promise<ProgressSnapshot>
) {
	set({ saving: true, error: undefined })

	try {
		const snapshot = await mutation()
		set({
			...deriveSnapshotState(snapshot),
			saving: false,
		})
		return snapshot
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Something went wrong.'
		set({ saving: false, error: message })
		throw error
	}
}

export const useAppStore = create<AppState>((set) => ({
	initialized: false,
	loading: true,
	saving: false,
	...deriveSnapshotState(initialSnapshot),
	initialize: async (user) => {
		set({ loading: true, error: undefined })

		try {
			const snapshot = await appServices.progressRepository.setUser(
				user ?? null
			)
			set({
				...deriveSnapshotState(snapshot),
				initialized: true,
				loading: false,
			})
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Progress could not be loaded.'
			set({ initialized: true, loading: false, error: message })
		}
	},
	getLesson: (lessonId: string) =>
		appServices.lessonService.getLesson(lessonId),
	completeLesson: (lesson, results) =>
		runSnapshotMutation(set, () =>
			appServices.lessonService.completeLesson(lesson, results)
		),
	setSpeakingSkipUntil: (speakingSkipUntil) =>
		runSnapshotMutation(set, () =>
			appServices.lessonService.setSpeakingSkipUntil(speakingSkipUntil)
		),
	submitReview: (reviewId, correct) =>
		runSnapshotMutation(set, () =>
			appServices.reviewService.submitReview(reviewId, correct)
		),
	updateSettings: (settings) =>
		runSnapshotMutation(set, () =>
			appServices.profileService.updateSettings(settings)
		),
	claimQuest: (questId) =>
		runSnapshotMutation(set, () =>
			appServices.economyService.claimQuest(questId)
		),
	buyShopItem: (itemId) =>
		runSnapshotMutation(set, () =>
			appServices.economyService.buyShopItem(itemId)
		),
	useShopItem: (itemId) =>
		runSnapshotMutation(set, () =>
			appServices.economyService.useShopItem(itemId)
		),
	toggleEquippedItem: (itemId) =>
		runSnapshotMutation(set, () =>
			appServices.economyService.toggleEquippedItem(itemId)
		),
	openPathChest: async (chestId) => {
		let reward: ChestReward | null = null

		await runSnapshotMutation(set, async () => {
			const result = await appServices.economyService.openPathChest(chestId)
			reward = result.reward
			return result.snapshot
		})

		return reward
	},
	openDailyChest: async () => {
		let reward: ChestReward | null = null

		await runSnapshotMutation(set, async () => {
			const result = await appServices.economyService.openDailyChest()
			reward = result.reward
			return result.snapshot
		})

		return reward
	},
	resetProgress: async () => {
		set({ saving: true, error: undefined })

		try {
			const snapshot = await appServices.progressRepository.reset()
			set({
				...deriveSnapshotState(snapshot),
				initialized: true,
				saving: false,
			})
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Progress could not be reset.'
			set({ saving: false, error: message })
			throw error
		}
	},
}))
