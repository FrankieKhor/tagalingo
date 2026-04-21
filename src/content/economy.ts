import type { Quest, ShopItem } from "@/lib/domain/models"

type QuestSeed = Omit<Quest, "id" | "progress" | "completed" | "claimed">

export const dailyQuestTemplates: QuestSeed[] = [
  {
    templateId: "daily-lesson-finish",
    kind: "daily",
    metric: "daily-lessons-completed",
    title: "Lesson On Lock",
    description: "Finish 1 lesson today.",
    target: 1,
    rewardPoints: 15,
  },
  {
    templateId: "daily-high-score",
    kind: "daily",
    metric: "daily-lesson-score",
    title: "Sharp Ear",
    description: "Reach 85% in a lesson today.",
    target: 85,
    rewardPoints: 18,
  },
  {
    templateId: "daily-streak-chain",
    kind: "daily",
    metric: "daily-correct-streak",
    title: "No Slip-Up",
    description: "Get 5 answers correct in a row in one lesson.",
    target: 5,
    rewardPoints: 16,
  },
  {
    templateId: "daily-review-burst",
    kind: "daily",
    metric: "daily-reviews-completed",
    title: "Memory Burst",
    description: "Finish 3 review cards today.",
    target: 3,
    rewardPoints: 14,
  },
  {
    templateId: "daily-xp-climb",
    kind: "daily",
    metric: "daily-xp-earned",
    title: "Pointing Up",
    description: "Earn 100 XP today.",
    target: 100,
    rewardPoints: 25,
  },
]

export const evergreenQuestSeeds: QuestSeed[] = [
  {
    templateId: "evergreen-first-lesson",
    kind: "evergreen",
    metric: "total-lessons-completed",
    title: "First Steps",
    description: "Complete your first lesson.",
    target: 1,
    rewardPoints: 40,
  },
  {
    templateId: "evergreen-streak-3",
    kind: "evergreen",
    metric: "total-streak-days",
    title: "Hot Streak",
    description: "Reach a 3-day streak.",
    target: 3,
    rewardPoints: 55,
  },
  {
    templateId: "evergreen-review-10",
    kind: "evergreen",
    metric: "total-reviews-completed",
    title: "Review Ranger",
    description: "Complete 10 review cards.",
    target: 10,
    rewardPoints: 65,
  },
  {
    templateId: "evergreen-xp-150",
    kind: "evergreen",
    metric: "total-xp-earned",
    title: "Tagalog Traction",
    description: "Reach 150 total XP.",
    target: 150,
    rewardPoints: 75,
  },
]

export const shopCatalog: ShopItem[] = [
  {
    id: "streak-freeze",
    name: "Streak Freeze",
    description: "Arm it to protect your streak from one missed day.",
    cost: 45,
    type: "power-up",
  },
  {
    id: "heart-refill",
    name: "Heart Refill",
    description: "Restore your hearts all the way back to full.",
    cost: 30,
    type: "consumable",
  },
  {
    id: "heart-snack",
    name: "Heart Snack",
    description: "Recover 2 hearts when you need a little boost.",
    cost: 18,
    type: "consumable",
  },
]

function hashString(value: string) {
  return Array.from(value).reduce((total, character, index) => {
    return total + character.charCodeAt(0) * (index + 17)
  }, 0)
}

export function generateDailyQuests(date: string): Quest[] {
  const rotation = hashString(date) % dailyQuestTemplates.length
  const selectedTemplates = Array.from({ length: 3 }, (_, index) => {
    return dailyQuestTemplates[(rotation + index) % dailyQuestTemplates.length]
  })

  return selectedTemplates.map((template) => ({
    ...template,
    id: `${template.templateId}-${date}`,
    progress: 0,
    completed: false,
    claimed: false,
  }))
}

export function createEvergreenQuests(): Quest[] {
  return evergreenQuestSeeds.map((template) => ({
    ...template,
    id: template.templateId,
    progress: 0,
    completed: false,
    claimed: false,
  }))
}
