import { ChevronRight, CircleEllipsis, Settings2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { SettingsSheet } from '@/components/common/settings-sheet'
import { cn } from '@/lib/utils'

export function DesktopMoreMenu() {
	const [menuOpen, setMenuOpen] = useState(false)
	const [settingsOpen, setSettingsOpen] = useState(false)
	const closeTimeoutRef = useRef<number | null>(null)

	function clearCloseTimeout() {
		if (closeTimeoutRef.current !== null) {
			window.clearTimeout(closeTimeoutRef.current)
			closeTimeoutRef.current = null
		}
	}

	function openMenu() {
		clearCloseTimeout()
		setMenuOpen(true)
	}

	function closeMenuWithDelay() {
		clearCloseTimeout()
		closeTimeoutRef.current = window.setTimeout(() => {
			setMenuOpen(false)
			closeTimeoutRef.current = null
		}, 220)
	}

	useEffect(() => {
		return () => clearCloseTimeout()
	}, [])

	return (
		<div
			className="relative"
			onMouseEnter={openMenu}
			onMouseLeave={closeMenuWithDelay}
			onFocusCapture={openMenu}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
					closeMenuWithDelay()
				}
			}}
		>
			<button
				type="button"
				aria-haspopup="menu"
				aria-expanded={menuOpen}
				className={cn(
					'flex w-full items-center gap-4 rounded-2xl border border-transparent px-4 py-4 text-sm font-bold uppercase tracking-[0.12em] text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-white',
					menuOpen &&
						'bg-slate-100 text-slate-900 dark:bg-white/5 dark:text-white'
				)}
				onClick={() => {
					clearCloseTimeout()
					setMenuOpen((current) => !current)
				}}
			>
				<CircleEllipsis className="size-5" />
				<span>More</span>
			</button>

			<div
				className={cn(
					'absolute left-full top-0 z-40 w-[17rem] pl-3 transition',
					menuOpen
						? 'pointer-events-auto translate-x-0 opacity-100'
						: 'pointer-events-none -translate-x-2 opacity-0'
				)}
			>
				<div
					role="menu"
					className="rounded-[24px] border border-slate-300 bg-white px-3 py-3 shadow-[0_24px_56px_-24px_rgba(15,23,42,0.5)] dark:border-white/12 dark:bg-[#18252d] dark:shadow-[0_24px_56px_-24px_rgba(2,8,23,0.8)]"
				>
					<p className="px-3 pb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
						More
					</p>
					<SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen}>
						<button
							type="button"
							role="menuitem"
							className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/85 dark:hover:bg-white/8 dark:hover:text-white"
						>
							<span className="flex items-center gap-3">
								<Settings2 className="size-4" />
								Settings
							</span>
							<ChevronRight className="size-4" />
						</button>
					</SettingsSheet>
				</div>
			</div>
		</div>
	)
}

export function MobileMoreButton() {
	const [open, setOpen] = useState(false)

	return (
		<SettingsSheet open={open} onOpenChange={setOpen}>
			<button
				type="button"
				aria-label="More"
				className={cn(
					'flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[0.68rem] font-semibold leading-none transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400',
					open
						? 'bg-sky-100 text-sky-700 dark:bg-white/10 dark:text-white'
						: 'text-slate-500 dark:text-white/65'
				)}
			>
				<CircleEllipsis className="size-4 shrink-0" />
				<span className="max-w-full truncate">More</span>
			</button>
		</SettingsSheet>
	)
}
