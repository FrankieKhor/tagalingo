import { motion } from 'framer-motion'
import { Outlet } from 'react-router-dom'

import { AuthPanel } from '@/components/auth/auth-panel'
import { DesktopSidebar } from '@/components/common/desktop-sidebar'
import { MobileNav } from '@/components/common/mobile-nav'
import { TopStatusBar } from '@/components/common/top-status-bar'
import { useAppStore } from '@/store/use-app-store'
import { useAuthStore } from '@/store/use-auth-store'

export function AppShell() {
	const snapshot = useAppStore((state) => state.snapshot)
	const loading = useAppStore((state) => state.loading)
	const saving = useAppStore((state) => state.saving)
	const useShopItem = useAppStore((state) => state.useShopItem)
	const user = useAuthStore((state) => state.user)
	const authLoading = useAuthStore((state) => state.loading)

	if (authLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.3),_transparent_32%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_48%,#ecfeff_100%)] px-4 text-slate-950 dark:bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_26%),linear-gradient(180deg,#08121b_0%,#091722_50%,#08111a_100%)] dark:text-white">
				<div className="text-center">
					<p className="text-sm font-black uppercase tracking-[0.22em] text-lime-400">
						Tagalingo
					</p>
					<p className="mt-3 text-lg text-slate-600 dark:text-white/70">
						Checking your account...
					</p>
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.3),_transparent_32%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_48%,#ecfeff_100%)] px-4 py-8 text-slate-950 dark:bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_26%),linear-gradient(180deg,#08121b_0%,#091722_50%,#08111a_100%)] dark:text-white">
				<div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center">
					<div className="mb-6">
						<p className="text-sm font-black uppercase tracking-[0.22em] text-lime-400">
							Tagalingo
						</p>
						<h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
							Create your learning account
						</h1>
						<p className="mt-3 text-lg leading-8 text-slate-600 dark:text-white/68">
							Sign up or sign in to save hearts, XP, streaks, lesson progress,
							quests, and review history.
						</p>
					</div>
					<AuthPanel />
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.3),_transparent_32%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_48%,#ecfeff_100%)] text-slate-950 transition-colors dark:bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_26%),linear-gradient(180deg,#08121b_0%,#091722_50%,#08111a_100%)] dark:text-white">
			<div className="flex min-h-screen w-full">
				<DesktopSidebar />
				<div className="min-h-screen min-w-0 flex-1 pb-24 lg:pb-0">
					<TopStatusBar
						points={snapshot.profile.points}
						streak={snapshot.profile.streak}
						hearts={snapshot.profile.hearts}
						inventory={snapshot.inventory}
						lastActiveOn={snapshot.profile.lastActiveOn}
						saving={saving}
						loading={loading || authLoading}
						useShopItem={useShopItem}
					/>
					<motion.main
						initial={{ opacity: 0, y: 18 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25 }}
						className="px-3 py-5 sm:px-4 sm:py-6 lg:px-8 lg:py-7"
					>
						<Outlet />
					</motion.main>
					<MobileNav />
				</div>
			</div>
		</div>
	)
}
