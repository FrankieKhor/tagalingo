import { RotateCcw, Settings2, Trophy } from "lucide-react"
import { useState } from "react"

import { PageHeader } from "@/components/common/page-header"
import { SettingsSheet } from "@/components/common/settings-sheet"
import { AchievementCard } from "@/components/profile/achievement-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/store/use-app-store"

export function ProfilePage() {
  const snapshot = useAppStore((state) => state.snapshot)
  const resetProgress = useAppStore((state) => state.resetProgress)
  const [open, setOpen] = useState(false)

  const achievementView = snapshot.profile.achievements

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title={snapshot.profile.displayName}
        description="Local guest progress, friendly settings, and the badges you've unlocked so far."
        action={
          <SettingsSheet>
            <Button variant="outline" className="rounded-full">
              <Settings2 className="size-4" />
            </Button>
          </SettingsSheet>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 dark:text-white/55">Total XP</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{snapshot.profile.xp}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 dark:text-white/55">Current streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{snapshot.profile.streak}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 dark:text-white/55">Lessons done</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {snapshot.profile.totalLessonsCompleted}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Achievements</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-white/55">{achievementView.length} unlocked</p>
        </div>
        {[
          {
            id: "first-steps",
            title: "First Steps",
            description: "Complete your first lesson.",
            icon: "🌱",
          },
          {
            id: "hello-tagalog",
            title: "Hello, Tagalog",
            description: "Reach 60 XP.",
            icon: "👋",
          },
          {
            id: "streak-starter",
            title: "Streak Starter",
            description: "Keep a 3-day streak.",
            icon: "🔥",
          },
          {
            id: "review-ranger",
            title: "Review Ranger",
            description: "Finish 5 review cards.",
            icon: "🧠",
          },
        ].map((achievement) => (
          <AchievementCard
            key={achievement.id}
            {...achievement}
            unlocked={achievementView.includes(achievement.id)}
          />
        ))}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="h-12 w-full rounded-2xl border-rose-200 text-rose-600">
            <RotateCcw className="size-4" />
            Reset local progress
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset everything?</DialogTitle>
            <DialogDescription>
              This clears local XP, streak, hearts, lesson completion, and review history.
            </DialogDescription>
          </DialogHeader>
          <Button
            className="h-12 w-full rounded-2xl bg-rose-500 text-white hover:bg-rose-600"
            onClick={() => {
              resetProgress()
              setOpen(false)
            }}
          >
            Reset progress
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
