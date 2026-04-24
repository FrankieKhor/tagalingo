import { StatPill } from '@/components/common/stat-pill'

type TopStatusBarProps = {
	xp: number
	points: number
	streak: number
	hearts: number
	loading?: boolean
}

export function TopStatusBar({
	xp,
	points,
	streak,
	hearts,
	loading = false,
}: TopStatusBarProps) {
	return (
		<div className="sticky top-0 z-20 border-b border-white/8 bg-[#09131d]/88 backdrop-blur-xl">
			<div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 lg:px-8">
				<div className="min-w-0 lg:hidden">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime-400">
						Tagalingo
					</p>
					<p className="truncate text-sm font-medium text-white/72">
						Learn playful everyday Tagalog
					</p>
				</div>
				<div className="ml-auto flex items-center gap-2 sm:gap-4">
					{loading ? (
						<div className="hidden rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-sky-100 sm:block">
							Syncing
						</div>
					) : null}
					<StatPill kind="xp" value={xp} className="hidden sm:flex" />
					<StatPill kind="streak" value={streak} />
					<StatPill kind="points" value={points} />
					<StatPill kind="hearts" value={hearts} />
				</div>
			</div>
		</div>
	)
}
