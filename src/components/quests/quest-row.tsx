import { CheckCircle2, Coins, Gift, ShieldCheck, Sparkles } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Quest } from '@/lib/domain/models'

type QuestRowProps = {
	quest: Quest
	onClaim?: (questId: string) => void
	compact?: boolean
}

function renderQuestIcon(quest: Quest) {
	if (quest.claimed) {
		return <CheckCircle2 className="size-4" />
	}

	if (quest.completed) {
		return <Gift className="size-4" />
	}

	return quest.kind === 'daily' ? (
		<Sparkles className="size-4" />
	) : (
		<ShieldCheck className="size-4" />
	)
}

export function QuestRow({ quest, onClaim, compact = false }: QuestRowProps) {
	const progress = Math.min((quest.progress / quest.target) * 100, 100)

	return (
		<Card className={compact ? 'rounded-[24px]' : undefined}>
			<CardContent className="space-y-4 p-5">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-3">
						<div className="mt-1 rounded-2xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-500/15 dark:text-sky-100">
							{renderQuestIcon(quest)}
						</div>
						<div>
							<p className="font-semibold text-slate-900 dark:text-white">
								{quest.title}
							</p>
							<p className="text-sm leading-6 text-slate-600 dark:text-white/70">
								{quest.description}
							</p>
						</div>
					</div>
					<div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
						{quest.kind}
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm text-slate-600 dark:text-white/70">
						<span>
							{quest.progress}/{quest.target}
						</span>
						<span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-200">
							<Coins className="size-3.5" />
							{quest.rewardPoints} pts
						</span>
					</div>
					<Progress value={progress} />
				</div>

				{quest.completed && !quest.claimed ? (
					<Button
						type="button"
						className="h-11 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
						onClick={() => onClaim?.(quest.id)}
					>
						Claim reward
					</Button>
				) : quest.claimed ? (
					<div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
						Reward claimed
					</div>
				) : null}
			</CardContent>
		</Card>
	)
}
