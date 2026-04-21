import { Coins, ShieldCheck, Sparkles } from "lucide-react"

import { QuestRow } from "@/components/quests/quest-row"
import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/store/use-app-store"

export function QuestsPage() {
  const snapshot = useAppStore((state) => state.snapshot)
  const claimQuest = useAppStore((state) => state.claimQuest)

  const dailyQuests = snapshot.quests.filter((quest) => quest.kind === "daily")
  const milestoneQuests = snapshot.quests.filter((quest) => quest.kind === "evergreen")
  const claimableCount = snapshot.quests.filter((quest) => quest.completed && !quest.claimed).length

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quests"
        title="Quest board"
        description="Daily challenges keep the routine playful, and milestone quests turn your long-term progress into spendable points."
        action={
          <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
            {snapshot.profile.points} pts
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-sky-100/80 bg-white/80 text-slate-900 shadow-[0_18px_60px_-32px_rgba(14,165,233,0.24)] dark:border-white/10 dark:bg-[#13212a] dark:text-white dark:shadow-none">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300">
              <Sparkles className="size-5" />
              <p className="text-sm font-black uppercase tracking-[0.16em]">Daily quests</p>
            </div>
            <p className="text-3xl font-black">{dailyQuests.length}</p>
            <p className="text-sm leading-6 text-slate-600 dark:text-white/75">
              A fresh set rotates every day using the actions you're already taking in lessons and review.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-200">
              <Coins className="size-5" />
              <p className="text-sm font-black uppercase tracking-[0.16em]">Claimable rewards</p>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{claimableCount}</p>
            <p className="text-sm leading-6 text-slate-600 dark:text-white/70">
              Completed quests stay here until you claim the points.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-200">
              <ShieldCheck className="size-5" />
              <p className="text-sm font-black uppercase tracking-[0.16em]">Milestones</p>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{milestoneQuests.length}</p>
            <p className="text-sm leading-6 text-slate-600 dark:text-white/70">
              Bigger one-time goals that reward consistent practice over time.
            </p>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {dailyQuests.map((quest) => (
            <QuestRow key={quest.id} quest={quest} onClaim={claimQuest} />
          ))}
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          {milestoneQuests.map((quest) => (
            <QuestRow key={quest.id} quest={quest} onClaim={claimQuest} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
