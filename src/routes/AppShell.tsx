import { motion } from 'framer-motion'
import { Outlet } from 'react-router-dom'

import { DesktopSidebar } from '@/components/common/desktop-sidebar'
import { MobileNav } from '@/components/common/mobile-nav'
import { TopStatusBar } from '@/components/common/top-status-bar'
import { useAppStore } from '@/store/use-app-store'

export function AppShell() {
	const snapshot = useAppStore((state) => state.snapshot)

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_26%),linear-gradient(180deg,#08121b_0%,#091722_50%,#08111a_100%)] text-white transition-colors">
			<div className="flex min-h-screen w-full">
				<DesktopSidebar />
				<div className="min-h-screen flex-1 pb-24 lg:pb-0">
					<TopStatusBar
						xp={snapshot.profile.xp}
						points={snapshot.profile.points}
						streak={snapshot.profile.streak}
						hearts={snapshot.profile.hearts}
					/>
					<motion.main
						initial={{ opacity: 0, y: 18 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25 }}
						className="px-4 py-6 lg:px-8 lg:py-7"
					>
						<Outlet />
					</motion.main>
					<MobileNav />
				</div>
			</div>
		</div>
	)
}
