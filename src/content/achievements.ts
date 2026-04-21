import type { Achievement } from "@/lib/domain/models"

export const achievementSeeds: Achievement[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Complete your first lesson.",
    icon: "🌱",
    requirement: "lessons",
    target: 1,
  },
  {
    id: "hello-tagalog",
    title: "Hello, Tagalog",
    description: "Reach 60 XP.",
    icon: "👋",
    requirement: "xp",
    target: 60,
  },
  {
    id: "streak-starter",
    title: "Streak Starter",
    description: "Keep a 3-day streak.",
    icon: "🔥",
    requirement: "streak",
    target: 3,
  },
  {
    id: "review-ranger",
    title: "Review Ranger",
    description: "Finish 5 review cards.",
    icon: "🧠",
    requirement: "reviews",
    target: 5,
  },
]
