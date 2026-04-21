import { ArrowRight, Coins, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

import { QuestRow } from "@/components/quests/quest-row"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Quest } from "@/lib/domain/models"

type QuestSummaryCardProps = {
  quests: Quest[]
  points: number
  claimableCount: number
  onClaim: (questId: string) => void
}

export function QuestSummaryCard({
  quests,
  points,
  claimableCount,
  onClaim,
}: QuestSummaryCardProps) {
  return (
    <Card className="border-none bg-white/90 dark:bg-[#17252f] dark:text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300">
            <Sparkles className="size-5" />
            <CardTitle className="text-base">Quest board</CardTitle>
          </div>
          <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
            {points} pts
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-600 dark:text-white/70">
          {claimableCount > 0
            ? `${claimableCount} reward${claimableCount === 1 ? "" : "s"} ready to claim.`
            : "Pick off a couple of daily quests to build up your shop points."}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {quests.length > 0 ? (
          quests.map((quest) => (
            <QuestRow key={quest.id} quest={quest} onClaim={onClaim} compact />
          ))
        ) : (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-600 dark:bg-white/5 dark:text-white/70">
            Your next batch of daily quests will show up here.
          </div>
        )}

        <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-white dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-medium text-white/85">
            <Coins className="size-4 text-amber-300" />
            Track rewards and spend points
          </div>
          <Button
            asChild
            variant="ghost"
            className="h-10 rounded-2xl text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/quests">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
