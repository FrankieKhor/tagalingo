import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Crown,
  Medal,
  Shield,
  Sparkles,
  Swords,
  TimerReset,
  Trophy,
} from "lucide-react"
import { Link } from "react-router-dom"

import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LeaderboardViewModel, LeagueTier } from "@/lib/domain/models"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/use-app-store"

const leagueThemes: Record<
  LeagueTier,
  {
    panel: string
    badge: string
    row: string
    accent: string
  }
> = {
  bronze: {
    panel: "from-amber-300 via-orange-300 to-amber-500 text-slate-950",
    badge: "bg-amber-100 text-amber-900",
    row: "border-amber-300/35 bg-amber-500/10",
    accent: "text-amber-300",
  },
  silver: {
    panel: "from-slate-200 via-slate-100 to-slate-400 text-slate-950",
    badge: "bg-slate-100 text-slate-900",
    row: "border-slate-300/35 bg-slate-400/10",
    accent: "text-slate-200",
  },
  gold: {
    panel: "from-yellow-200 via-amber-200 to-yellow-500 text-slate-950",
    badge: "bg-yellow-100 text-yellow-900",
    row: "border-yellow-300/35 bg-yellow-400/10",
    accent: "text-yellow-300",
  },
  sapphire: {
    panel: "from-sky-300 via-cyan-200 to-blue-500 text-slate-950",
    badge: "bg-sky-100 text-sky-900",
    row: "border-sky-300/35 bg-sky-500/10",
    accent: "text-sky-300",
  },
  ruby: {
    panel: "from-rose-300 via-pink-200 to-red-500 text-slate-950",
    badge: "bg-rose-100 text-rose-900",
    row: "border-rose-300/35 bg-rose-500/10",
    accent: "text-rose-300",
  },
  emerald: {
    panel: "from-emerald-300 via-green-200 to-emerald-500 text-slate-950",
    badge: "bg-emerald-100 text-emerald-900",
    row: "border-emerald-300/35 bg-emerald-500/10",
    accent: "text-emerald-300",
  },
  amethyst: {
    panel: "from-fuchsia-300 via-violet-200 to-purple-500 text-slate-950",
    badge: "bg-fuchsia-100 text-fuchsia-900",
    row: "border-fuchsia-300/35 bg-fuchsia-500/10",
    accent: "text-fuchsia-300",
  },
  pearl: {
    panel: "from-cyan-100 via-white to-cyan-300 text-slate-950",
    badge: "bg-cyan-50 text-cyan-900",
    row: "border-cyan-300/35 bg-cyan-400/10",
    accent: "text-cyan-100",
  },
  obsidian: {
    panel: "from-slate-500 via-slate-700 to-slate-950 text-white",
    badge: "bg-slate-700 text-white",
    row: "border-slate-500/35 bg-slate-500/10",
    accent: "text-slate-300",
  },
  diamond: {
    panel: "from-cyan-200 via-sky-100 to-indigo-300 text-slate-950",
    badge: "bg-cyan-100 text-cyan-900",
    row: "border-cyan-200/50 bg-cyan-300/10",
    accent: "text-cyan-200",
  },
}

function getResultTone(outcome: NonNullable<LeaderboardViewModel["lastResult"]>["outcome"]) {
  if (outcome === "promoted") {
    return {
      icon: ArrowUp,
      chip: "bg-emerald-500/15 text-emerald-300",
      border: "border-emerald-400/25",
    }
  }

  if (outcome === "demoted") {
    return {
      icon: ArrowDown,
      chip: "bg-rose-500/15 text-rose-300",
      border: "border-rose-400/25",
    }
  }

  return {
    icon: ArrowRight,
    chip: "bg-sky-500/15 text-sky-300",
    border: "border-sky-400/25",
  }
}

function LeagueTrack({ view }: { view: LeaderboardViewModel }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {view.tiers.map((tier) => (
        <div
          key={tier.id}
          className={cn(
            "flex min-w-[78px] items-center justify-center rounded-2xl border px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition",
            tier.active
              ? "border-white/30 bg-white/15 text-white shadow-[0_10px_30px_-18px_rgba(255,255,255,0.55)]"
              : tier.locked
                ? "border-white/10 bg-slate-950/15 text-white/45"
                : "border-white/10 bg-slate-950/10 text-white/70"
          )}
        >
          {tier.label}
        </div>
      ))}
    </div>
  )
}

export function LeaderboardsPage() {
  const view = useAppStore((state) => state.leaderboardView)
  const snapshot = useAppStore((state) => state.snapshot)
  const theme = leagueThemes[view.currentLeague]
  const resultTone = view.lastResult ? getResultTone(view.lastResult.outcome) : null

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Leaderboards"
        title={`${view.currentLeagueLabel} League`}
        description={
          view.hasActiveCycle
            ? "Earn as much XP as you can before your rolling seven-day board expires."
            : "Your next league board starts the moment you earn XP."
        }
        action={
          view.timeRemainingLabel ? (
            <div className="rounded-full bg-sky-50 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
              {view.timeRemainingLabel}
            </div>
          ) : null
        }
      />

      <section
        className={cn(
          "overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br p-6 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.65)]",
          theme.panel
        )}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_320px] lg:items-start">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-[28px] bg-slate-950/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                <Trophy className="size-10" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] opacity-75">Current league</p>
                <h2 className="text-4xl font-black tracking-tight">{view.currentLeagueLabel}</h2>
                <p className="mt-1 text-sm font-semibold opacity-80">
                  {view.hasActiveCycle
                    ? `Weekly XP this cycle: ${view.playerRow?.weeklyXp ?? 0}`
                    : "Earn XP to join your next rolling seven-day board."}
                </p>
              </div>
            </div>

            <LeagueTrack view={view} />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] bg-slate-950/12 px-4 py-4 ring-1 ring-white/12">
                <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">Promotion</p>
                <p className="mt-2 text-2xl font-black">Top 3</p>
              </div>
              <div className="rounded-[24px] bg-slate-950/12 px-4 py-4 ring-1 ring-white/12">
                <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">Demotion</p>
                <p className="mt-2 text-2xl font-black">Bottom 3</p>
              </div>
              <div className="rounded-[24px] bg-slate-950/12 px-4 py-4 ring-1 ring-white/12">
                <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">You</p>
                <p className="mt-2 text-2xl font-black">{snapshot.profile.displayName}</p>
              </div>
            </div>
          </div>

          <Card className="border-white/15 bg-slate-950/18 text-inherit shadow-none">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em]">
                <Shield className="size-4" />
                Cycle status
              </div>

              {view.lastResult && resultTone ? (
                <div className={cn("rounded-[24px] border bg-slate-950/14 p-4", resultTone.border)}>
                  <div className="flex items-center gap-2">
                    <div className={cn("rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em]", resultTone.chip)}>
                      <resultTone.icon className="mr-1 inline size-3.5" />
                      {view.lastResult.outcome}
                    </div>
                  </div>
                  <p className="mt-3 text-lg font-black">{view.lastResult.title}</p>
                  <p className="mt-2 text-sm leading-6 opacity-85">{view.lastResult.description}</p>
                </div>
              ) : null}

              <div className="rounded-[24px] bg-slate-950/14 p-4 ring-1 ring-white/10">
                <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">
                  {view.hasActiveCycle ? "Current board" : "Next board"}
                </p>
                <p className="mt-2 text-base font-black">
                  {view.hasActiveCycle
                    ? "Your local board is live and updating as you earn XP."
                    : "Your next board starts after your first XP gain."}
                </p>
                <p className="mt-2 text-sm leading-6 opacity-80">
                  {view.hasActiveCycle
                    ? "Bots are deterministic for the week, so standings feel alive without needing a backend."
                    : "Use Learn or Review to get placed into a fresh set of rivals for the next seven days."}
                </p>
              </div>

              <Button
                asChild
                className="h-12 w-full rounded-[18px] border-0 bg-slate-950/85 text-white hover:bg-slate-950"
              >
                <Link to="/">{view.hasActiveCycle ? "Earn more XP" : "Start a lesson"}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {!view.hasActiveCycle ? (
        <Card className="overflow-hidden border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#13212a]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                <Sparkles className="size-3.5" />
                Waiting for XP
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Earn XP to join this week&apos;s board
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-white/75">
                Your leaderboard only starts when you do. Finish a lesson, review cards, or crack open an XP chest and
                we&apos;ll generate a fresh seven-day race in your current league.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-[#101c24]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-slate-500 dark:text-white/55">
                  <Swords className="size-4" />
                  How it works
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-white/75">
                  Top 3 move up. Bottom 3 move down. Everyone else holds their spot until the next cycle.
                </p>
                <Button asChild className="h-11 w-full rounded-[18px] bg-sky-500 text-white hover:bg-sky-600">
                  <Link to="/">Start a lesson</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <Card className="overflow-hidden border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#13212a]">
            <CardHeader className="border-b border-slate-200/70 pb-4 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl">Weekly standings</CardTitle>
                  <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
                    Climb into the top three before the cycle runs out.
                  </p>
                </div>
                <Badge className={cn("rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em]", theme.badge)}>
                  10 rivals
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {view.rows.map((row) => (
                <div
                  key={row.id}
                  className={cn(
                    "flex items-center gap-3 rounded-[24px] border px-4 py-4 transition",
                    row.isPlayer
                      ? "border-sky-400 bg-sky-50 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.25)] dark:bg-sky-500/10"
                      : row.promotionZone
                        ? "border-emerald-300/25 bg-emerald-500/8"
                        : row.demotionZone
                          ? "border-rose-300/25 bg-rose-500/8"
                          : "border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5",
                    row.isPlayer && theme.row
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-700 dark:bg-[#0f1b22] dark:text-white">
                    {row.rank <= 3 ? <Medal className="size-4" /> : row.rank}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-[#0f1b22]">
                    {row.avatarEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-black text-slate-900 dark:text-white">{row.displayName}</p>
                      {row.isPlayer ? (
                        <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.14em] text-sky-300">
                          You
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                      {row.promotionZone ? (
                        <span className="text-emerald-400">Promotion zone</span>
                      ) : row.demotionZone ? (
                        <span className="text-rose-400">Demotion zone</span>
                      ) : (
                        <span className="text-slate-500 dark:text-white/45">Safe</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-white">{row.weeklyXp}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/45">
                      XP
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4 lg:sticky lg:top-24">
            <Card className="border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#13212a]">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-slate-500 dark:text-white/55">
                  <TimerReset className="size-4" />
                  Current pace
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-lime-400 transition-all"
                    style={{ width: `${Math.max(8, Math.round(view.cycleProgress * 100))}%` }}
                  />
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-white/75">
                  The board is local, but the bots ramp up over the week so your placement feels alive the whole time.
                </p>
              </CardContent>
            </Card>

            {view.playerRow ? (
              <Card className="border-sky-400/30 bg-sky-50/80 shadow-[0_18px_50px_-30px_rgba(56,189,248,0.45)] dark:bg-sky-500/10">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-200">
                    <Crown className="size-4" />
                    Your spot
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm dark:bg-[#0f1b22]">
                      {snapshot.profile.avatarEmoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-black text-slate-900 dark:text-white">
                        #{view.playerRow.rank} {snapshot.profile.displayName}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-white/75">{view.playerRow.weeklyXp} weekly XP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      )}
    </div>
  )
}
