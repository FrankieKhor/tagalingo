import {
	BookOpen,
	ChevronRight,
	RefreshCw,
	Settings,
	ShoppingBag,
	Shield,
	Trophy,
	User,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { SettingsSheet } from '@/components/common/settings-sheet'
import { getRemainingAchievementCount } from '@/lib/domain/achievements'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'

const items = [
	{ to: '/', label: 'Learn', icon: BookOpen },
	{ to: '/review', label: 'Practice', icon: RefreshCw },
	{ to: '/leaderboards', label: 'Leaderboards', icon: Trophy },
	{ to: '/quests', label: 'Quests', icon: Shield },
	{ to: '/shop', label: 'Shop', icon: ShoppingBag },
	{ to: '/profile', label: 'Profile', icon: User },
]

export function DesktopSidebar() {
	const remainingAchievements = useAppStore((state) =>
		getRemainingAchievementCount(state.snapshot.profile)
	)
	const claimableQuestCount = useAppStore(
		(state) =>
			state.snapshot.quests.filter((quest) => quest.completed && !quest.claimed)
				.length
	)
	const activeDailyQuestCount = useAppStore(
		(state) =>
			state.snapshot.quests.filter(
				(quest) => quest.kind === 'daily' && !quest.claimed
			).length
	)
	const questNotificationCount =
		claimableQuestCount > 0 ? claimableQuestCount : activeDailyQuestCount
	const questNotificationLabel =
		claimableQuestCount > 0
			? `${claimableQuestCount} quest rewards ready to claim`
			: `${activeDailyQuestCount} daily quests active`

	return (
		<aside className="sticky top-0 z-30 hidden h-screen w-[236px] shrink-0 border-r border-slate-200/80 bg-white/88 px-4 py-7 text-slate-950 shadow-[12px_0_40px_-32px_rgba(15,23,42,0.4)] backdrop-blur-xl lg:flex lg:flex-col dark:border-white/8 dark:bg-[#0c1620] dark:text-white dark:shadow-none">
			<div className="mb-9 px-3">
				<p className="text-[2.55rem] font-black leading-none tracking-tight text-lime-400">
					tagalingo
				</p>
				<p className="mt-1 text-sm text-slate-500 dark:text-white/68">
					Learn Tagalog
				</p>
			</div>

			<nav className="space-y-2.5">
				{items.map((item) => {
					const Icon = item.icon
					const showAchievementDot =
						item.to === '/profile' && remainingAchievements > 0
					const showQuestDot =
						item.to === '/quests' && questNotificationCount > 0
					const notificationLabel = showAchievementDot
						? `${remainingAchievements} achievements left to complete`
						: showQuestDot
							? questNotificationLabel
							: undefined

					return (
						<NavLink
							key={item.to}
							to={item.to}
							aria-label={
								notificationLabel
									? `${item.label}, ${notificationLabel}`
									: item.label
							}
							className={({ isActive }) =>
								cn(
									'flex items-center gap-4 rounded-3xl border px-4 py-4 text-base font-semibold transition',
									isActive
										? 'border-lime-300 bg-lime-50 text-slate-950 dark:border-lime-400 dark:bg-white/6 dark:text-white'
										: 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-white/78 dark:hover:bg-white/4 dark:hover:text-white'
								)
							}
						>
							<Icon className="size-5" />
							<span className="flex min-w-0 flex-1 items-center gap-2">
								<span>{item.label}</span>
								{showAchievementDot || showQuestDot ? (
									<span
										className="size-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-[#0c1620]"
										aria-hidden="true"
									/>
								) : null}
							</span>
						</NavLink>
					)
				})}
			</nav>

			<div className="mt-auto border-t border-slate-200 pt-5 dark:border-white/8">
				<SettingsSheet>
					<button
						type="button"
						className="flex w-full items-center justify-between rounded-3xl border border-transparent px-4 py-4 text-left text-base font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-white/78 dark:hover:bg-white/4 dark:hover:text-white"
					>
						<span className="flex items-center gap-4">
							<Settings className="size-5" />
							Settings
						</span>
						<ChevronRight className="size-4" />
					</button>
				</SettingsSheet>
			</div>
		</aside>
	)
}
