import { Heart, Shield, ShoppingBag, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ShopItem, ShopItemId } from '@/lib/domain/models'

type ShopItemCardProps = {
	item: ShopItem
	owned: number
	equipped: boolean
	canAfford: boolean
	canUse: boolean
	points: number
	sectionLabel: string
	onBuy: (itemId: ShopItemId) => void
	onUse: (itemId: Extract<ShopItemId, 'heart-refill' | 'heart-snack'>) => void
	onToggleEquip: (itemId: Extract<ShopItemId, 'streak-freeze'>) => void
}

function renderItemIcon(itemId: ShopItemId) {
	switch (itemId) {
		case 'streak-freeze':
			return <Shield className="size-5" />
		case 'heart-refill':
			return <Heart className="size-5" />
		case 'heart-snack':
			return <Zap className="size-5" />
	}
}

function getIconClassName(itemId: ShopItemId) {
	switch (itemId) {
		case 'streak-freeze':
			return 'bg-cyan-500/10 text-cyan-700 ring-cyan-500/20 dark:text-cyan-200'
		case 'heart-refill':
			return 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-200'
		case 'heart-snack':
			return 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-200'
	}
}

function getStateLabel({
	item,
	owned,
	equipped,
	canAfford,
	canUse,
	points,
}: Pick<
	ShopItemCardProps,
	'item' | 'owned' | 'equipped' | 'canAfford' | 'canUse' | 'points'
>) {
	if (item.id === 'streak-freeze' && equipped) {
		return 'Armed'
	}

	if (item.id !== 'streak-freeze' && !canUse && owned > 0) {
		return 'Full'
	}

	if (!canAfford && owned === 0) {
		return `Need ${item.cost - points} more pts`
	}

	if (owned > 0) {
		return `Owned: ${owned}`
	}

	return 'Ready'
}

export function ShopItemCard({
	item,
	owned,
	equipped,
	canAfford,
	canUse,
	points,
	sectionLabel,
	onBuy,
	onUse,
	onToggleEquip,
}: ShopItemCardProps) {
	const stateLabel = getStateLabel({
		item,
		owned,
		equipped,
		canAfford,
		canUse,
		points,
	})
	const canActivate = item.id === 'streak-freeze' ? owned > 0 : canUse

	return (
		<Card className="overflow-hidden border-slate-200/80 bg-white/85 shadow-sm dark:border-white/10 dark:bg-[#13212a]/90">
			<CardContent className="p-0">
				<div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
					<div className="flex min-w-0 items-start gap-4">
						<div
							className={cn(
								'grid size-12 shrink-0 place-items-center rounded-xl ring-1',
								getIconClassName(item.id)
							)}
						>
							{renderItemIcon(item.id)}
						</div>

						<div className="min-w-0 space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<p className="font-semibold text-slate-950 dark:text-white">
									{item.name}
								</p>
								<Badge variant="outline" className="px-2 py-0.5 text-[0.68rem]">
									{sectionLabel}
								</Badge>
								<Badge
									variant={stateLabel === 'Ready' ? 'secondary' : 'outline'}
									className="px-2 py-0.5 text-[0.68rem]"
								>
									{stateLabel}
								</Badge>
							</div>
							<p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-white/70">
								{item.description}
							</p>
						</div>
					</div>

					<div className="grid gap-3 sm:min-w-56 sm:grid-cols-[auto_1fr] sm:items-center">
						<div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
							{item.cost} pts
						</div>

						<div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
							<Button
								type="button"
								className="h-10 rounded-xl bg-emerald-500 font-black text-white hover:bg-emerald-400 dark:text-slate-950"
								onClick={() => onBuy(item.id)}
								disabled={!canAfford}
							>
								<ShoppingBag className="size-4" />
								Buy
							</Button>

							{item.id === 'streak-freeze' ? (
								<Button
									type="button"
									variant="outline"
									className="h-10 rounded-xl"
									onClick={() => onToggleEquip('streak-freeze')}
									disabled={!canActivate && !equipped}
								>
									{equipped ? 'Disarm' : 'Arm'}
								</Button>
							) : (
								<Button
									type="button"
									variant="outline"
									className="h-10 rounded-xl"
									onClick={() =>
										onUse(
											item.id as Extract<
												ShopItemId,
												'heart-refill' | 'heart-snack'
											>
										)
									}
									disabled={!canActivate}
								>
									Use now
								</Button>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
