import { Coins, Gift, Heart, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DailyChestCardProps = {
  state: "locked" | "ready" | "opened"
  onOpen: () => void
}

export function DailyChestCard({ state, onOpen }: DailyChestCardProps) {
  const isReady = state === "ready"

  return (
    <Card className="overflow-hidden border-amber-100/80 bg-white/90 shadow-[0_18px_60px_-32px_rgba(245,158,11,0.22)] dark:border-white/10 dark:bg-[#17252f] dark:shadow-none">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.16),_transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.18),_transparent_35%)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
              <Gift className="size-5" />
              <CardTitle className="text-base">Daily chest</CardTitle>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
              <Coins className="size-3.5" />
              <Heart className="size-3.5" />
              XP
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/75">
            {state === "locked"
              ? "Complete one lesson or one review card today to unlock this chest."
              : state === "ready"
                ? "Your daily chest is ready. Open it for a random reward."
                : "You already opened today’s chest. Come back after tomorrow’s reset."}
          </div>

          {isReady ? (
            <Button
              type="button"
              className="h-11 w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-slate-950 hover:opacity-95"
              onClick={onOpen}
            >
              Open chest
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/55">
              {state === "locked" ? <Lock className="size-4" /> : <Gift className="size-4" />}
              {state === "locked" ? "Locked for now" : "Opened today"}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
