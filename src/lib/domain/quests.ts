import {
  createEvergreenQuests,
  generateDailyQuests,
} from "@/content/economy"
import type { ProgressSnapshot, Quest, QuestMetric } from "@/lib/domain/models"

function getMetricValue(snapshot: ProgressSnapshot, metric: QuestMetric) {
  switch (metric) {
    case "daily-lessons-completed":
      return snapshot.dailyStats.lessonSessionsCompleted
    case "daily-lesson-score":
      return snapshot.dailyStats.bestLessonScore
    case "daily-correct-streak":
      return snapshot.dailyStats.bestCorrectStreak
    case "daily-reviews-completed":
      return snapshot.dailyStats.reviewCardsCompleted
    case "daily-xp-earned":
      return snapshot.profile.dailyGoal.currentXp
    case "total-lessons-completed":
      return snapshot.profile.totalLessonsCompleted
    case "total-streak-days":
      return snapshot.profile.streak
    case "total-reviews-completed":
      return snapshot.profile.totalReviewsCompleted
    case "total-xp-earned":
      return snapshot.profile.xp
  }
}

export function syncQuestProgress(snapshot: ProgressSnapshot): ProgressSnapshot {
  return {
    ...snapshot,
    quests: snapshot.quests.map((quest) => {
      const progress = Math.min(getMetricValue(snapshot, quest.metric), quest.target)
      return {
        ...quest,
        progress,
        completed: progress >= quest.target,
      }
    }),
  }
}

export function ensureQuestState(snapshot: ProgressSnapshot, today: string): ProgressSnapshot {
  const evergreenByTemplateId = new Map(
    snapshot.quests
      .filter((quest) => quest.kind === "evergreen")
      .map((quest) => [quest.templateId, quest])
  )
  const evergreenQuests = createEvergreenQuests().map((quest) => {
    const existing = evergreenByTemplateId.get(quest.templateId)
    return existing ? { ...quest, ...existing, id: quest.id, templateId: quest.templateId } : quest
  })

  const currentDailyQuests = snapshot.quests.filter(
    (quest) => quest.kind === "daily" && snapshot.lastQuestRefreshOn === today
  )
  const dailyQuests =
    currentDailyQuests.length > 0 ? currentDailyQuests : generateDailyQuests(today)

  return syncQuestProgress({
    ...snapshot,
    quests: [...dailyQuests, ...evergreenQuests],
    lastQuestRefreshOn: today,
  })
}

export function claimQuestReward(snapshot: ProgressSnapshot, questId: string): ProgressSnapshot {
  const quest = snapshot.quests.find((entry) => entry.id === questId)

  if (!quest || !quest.completed || quest.claimed) {
    return snapshot
  }

  return {
    ...snapshot,
    profile: {
      ...snapshot.profile,
      points: snapshot.profile.points + quest.rewardPoints,
    },
    quests: snapshot.quests.map((entry) =>
      entry.id === questId ? { ...entry, claimed: true } : entry
    ),
  }
}

export function getQuestCounts(quests: Quest[]) {
  const claimable = quests.filter((quest) => quest.completed && !quest.claimed).length
  const activeDaily = quests.filter((quest) => quest.kind === "daily" && !quest.claimed)

  return {
    claimable,
    activeDaily,
  }
}
