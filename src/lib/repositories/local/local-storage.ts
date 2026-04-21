import { createInitialSnapshot, defaultSettings } from "@/lib/domain/progress"
import { createBrowserStorageAdapter } from "@/lib/storage/adapter"
import { storageKeys } from "@/lib/storage/keys"

export const storageAdapter = createBrowserStorageAdapter()

export function readStoredProgress() {
  const initial = createInitialSnapshot()
  const stored = storageAdapter.getItem(storageKeys.progress, initial)

  return {
    ...initial,
    ...stored,
    profile: {
      ...initial.profile,
      ...stored.profile,
      dailyGoal: {
        ...initial.profile.dailyGoal,
        ...stored.profile?.dailyGoal,
      },
    },
    dailyStats: {
      ...initial.dailyStats,
      ...stored.dailyStats,
    },
    settings: {
      ...initial.settings,
      ...stored.settings,
    },
    inventory: {
      ...initial.inventory,
      ...stored.inventory,
    },
    leaderboard: {
      ...initial.leaderboard,
      ...stored.leaderboard,
      currentCycle: stored.leaderboard?.currentCycle
        ? {
            ...stored.leaderboard.currentCycle,
            entries: stored.leaderboard.currentCycle.entries ?? initial.leaderboard.currentCycle?.entries ?? [],
          }
        : initial.leaderboard.currentCycle,
      lastResult: stored.leaderboard?.lastResult ?? initial.leaderboard.lastResult,
    },
    lessonProgress: stored.lessonProgress ?? initial.lessonProgress,
    reviewQueue: stored.reviewQueue ?? initial.reviewQueue,
    weakWords: stored.weakWords ?? initial.weakWords,
    speakingAttempts: stored.speakingAttempts ?? initial.speakingAttempts,
    quests: stored.quests ?? initial.quests,
    equippedPowerUps: stored.equippedPowerUps ?? initial.equippedPowerUps,
    openedPathChestIds: stored.openedPathChestIds ?? initial.openedPathChestIds,
    lastDailyChestOpenedOn: stored.lastDailyChestOpenedOn ?? initial.lastDailyChestOpenedOn,
  }
}

export function writeStoredProgress(value: ReturnType<typeof createInitialSnapshot>) {
  storageAdapter.setItem(storageKeys.progress, value)
}

export function readStoredSettings() {
  const stored = storageAdapter.getItem(storageKeys.settings, defaultSettings)
  return {
    ...defaultSettings,
    ...stored,
  }
}

export function writeStoredSettings(settings: typeof defaultSettings) {
  storageAdapter.setItem(storageKeys.settings, settings)
}
