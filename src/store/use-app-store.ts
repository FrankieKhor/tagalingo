import { create } from "zustand"

import { buildLeaderboardView } from "@/lib/domain/progress"
import { appServices } from "@/lib/services/app-services"
import type {
  AppSettings,
  ChestReward,
  ExerciseResult,
  LeaderboardViewModel,
  Lesson,
  ProgressSnapshot,
  ShopItemId,
  VoiceCapability,
} from "@/lib/domain/models"

type AppState = {
  initialized: boolean
  snapshot: ProgressSnapshot
  units: ReturnType<typeof appServices.lessonService.getUnits>
  path: ReturnType<typeof appServices.lessonService.getPath>
  learnUnits: ReturnType<typeof appServices.lessonService.getLearnUnits>
  leaderboardView: LeaderboardViewModel
  voiceCapability: VoiceCapability
  initialize: () => void
  getLesson: (lessonId: string) => Lesson | undefined
  completeLesson: (lesson: Lesson, results: ExerciseResult[]) => ProgressSnapshot
  setSpeakingSkipUntil: (speakingSkipUntil?: string) => ProgressSnapshot
  submitReview: (reviewId: string, correct: boolean) => ProgressSnapshot
  updateSettings: (settings: AppSettings) => ProgressSnapshot
  claimQuest: (questId: string) => ProgressSnapshot
  buyShopItem: (itemId: ShopItemId) => ProgressSnapshot
  useShopItem: (itemId: Extract<ShopItemId, "heart-refill" | "heart-snack">) => ProgressSnapshot
  toggleEquippedItem: (itemId: Extract<ShopItemId, "streak-freeze">) => ProgressSnapshot
  openPathChest: (chestId: string) => ChestReward | null
  openDailyChest: () => ChestReward | null
  resetProgress: () => void
}

function snapshotState() {
  const snapshot = appServices.progressRepository.getSnapshot()

  return {
    snapshot,
    units: appServices.lessonService.getUnits(),
    path: appServices.lessonService.getPath(snapshot),
    learnUnits: appServices.lessonService.getLearnUnits(snapshot),
    leaderboardView: buildLeaderboardView(snapshot),
    voiceCapability: appServices.voiceService.getCapability(),
  }
}

export const useAppStore = create<AppState>((set) => ({
  initialized: false,
  ...snapshotState(),
  initialize: () => set({ initialized: true, ...snapshotState() }),
  getLesson: (lessonId: string) => appServices.lessonService.getLesson(lessonId),
  completeLesson: (lesson, results) => {
    const snapshot = appServices.lessonService.completeLesson(lesson, results)
    set({
      snapshot,
      path: appServices.lessonService.getPath(snapshot),
      learnUnits: appServices.lessonService.getLearnUnits(snapshot),
      leaderboardView: buildLeaderboardView(snapshot),
    })
    return snapshot
  },
  setSpeakingSkipUntil: (speakingSkipUntil) => {
    const snapshot = appServices.lessonService.setSpeakingSkipUntil(speakingSkipUntil)
    set({ snapshot, leaderboardView: buildLeaderboardView(snapshot) })
    return snapshot
  },
  submitReview: (reviewId, correct) => {
    const snapshot = appServices.reviewService.submitReview(reviewId, correct)
    set({
      snapshot,
      path: appServices.lessonService.getPath(snapshot),
      learnUnits: appServices.lessonService.getLearnUnits(snapshot),
      leaderboardView: buildLeaderboardView(snapshot),
    })
    return snapshot
  },
  updateSettings: (settings) => {
    const snapshot = appServices.profileService.updateSettings(settings)
    set({ snapshot, leaderboardView: buildLeaderboardView(snapshot) })
    return snapshot
  },
  claimQuest: (questId) => {
    const snapshot = appServices.economyService.claimQuest(questId)
    set({ snapshot, leaderboardView: buildLeaderboardView(snapshot) })
    return snapshot
  },
  buyShopItem: (itemId) => {
    const snapshot = appServices.economyService.buyShopItem(itemId)
    set({ snapshot, leaderboardView: buildLeaderboardView(snapshot) })
    return snapshot
  },
  useShopItem: (itemId) => {
    const snapshot = appServices.economyService.useShopItem(itemId)
    set({ snapshot, leaderboardView: buildLeaderboardView(snapshot) })
    return snapshot
  },
  toggleEquippedItem: (itemId) => {
    const snapshot = appServices.economyService.toggleEquippedItem(itemId)
    set({ snapshot, leaderboardView: buildLeaderboardView(snapshot) })
    return snapshot
  },
  openPathChest: (chestId) => {
    const { snapshot, reward } = appServices.economyService.openPathChest(chestId)
    set({
      snapshot,
      path: appServices.lessonService.getPath(snapshot),
      learnUnits: appServices.lessonService.getLearnUnits(snapshot),
      leaderboardView: buildLeaderboardView(snapshot),
    })
    return reward
  },
  openDailyChest: () => {
    const { snapshot, reward } = appServices.economyService.openDailyChest()
    set({
      snapshot,
      path: appServices.lessonService.getPath(snapshot),
      learnUnits: appServices.lessonService.getLearnUnits(snapshot),
      leaderboardView: buildLeaderboardView(snapshot),
    })
    return reward
  },
  resetProgress: () =>
    set({
      ...snapshotState(),
      initialized: true,
    }),
}))
