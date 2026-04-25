import {
	BookOpen,
	RefreshCw,
	Shield,
	ShoppingBag,
	Trophy,
	User,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { MobileMoreButton } from '@/components/common/more-menu'
import { cn } from '@/lib/utils'

const items = [
	{ to: '/', label: 'Learn', icon: BookOpen },
	{ to: '/review', label: 'Review', icon: RefreshCw },
	{ to: '/leaderboards', label: 'League', icon: Trophy },
	{ to: '/quests', label: 'Quests', icon: Shield },
	{ to: '/shop', label: 'Shop', icon: ShoppingBag },
	{ to: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
	return (
		<nav className="fixed inset-x-0 bottom-0 z-20 mx-auto border-t border-white/70 bg-white/92 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-[#101f28]/92">
			<div className="grid grid-cols-7 gap-1">
				{items.map((item) => {
					const Icon = item.icon
					return (
						<NavLink
							key={item.to}
							to={item.to}
							aria-label={item.label}
							className={({ isActive }) =>
								cn(
									'flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[0.68rem] font-semibold leading-none transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400',
									isActive
										? 'bg-sky-100 text-sky-700 dark:bg-white/10 dark:text-white'
										: 'text-slate-500 dark:text-white/65'
								)
							}
						>
							<Icon className="size-4 shrink-0" />
							<span className="max-w-full truncate">{item.label}</span>
						</NavLink>
					)
				})}
				<MobileMoreButton />
			</div>
		</nav>
	)
}
