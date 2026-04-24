import { Heart, Shield, ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ShopItem, ShopItemId } from '@/lib/domain/models'

type ShopItemCardProps = {
	item: ShopItem
	owned: number
	equipped: boolean
	canAfford: boolean
	canUse: boolean
	onBuy: (itemId: ShopItemId) => void
	onUse: (itemId: Extract<ShopItemId, 'heart-refill' | 'heart-snack'>) => void
	onToggleEquip: (itemId: Extract<ShopItemId, 'streak-freeze'>) => void
}

function renderItemIcon(itemId: ShopItemId) {
	switch (itemId) {
		case 'streak-freeze':
			return <Shield className="size-5" />
		case 'heart-refill':
		case 'heart-snack':
			return <Heart className="size-5" />
	}
}

export function ShopItemCard({
	item,
	owned,
	equipped,
	canAfford,
	canUse,
	onBuy,
	onUse,
	onToggleEquip,
}: ShopItemCardProps) {
	return (
		<Card>
			<CardContent className="space-y-4 p-5">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-3">
						<div className="rounded-2xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-500/15 dark:text-sky-100">
							{renderItemIcon(item.id)}
						</div>
						<div>
							<p className="font-semibold text-slate-900 dark:text-white">
								{item.name}
							</p>
							<p className="text-sm leading-6 text-slate-600 dark:text-white/70">
								{item.description}
							</p>
						</div>
					</div>
					<div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
						{item.cost} pts
					</div>
				</div>

				<div className="flex items-center justify-between text-sm text-slate-600 dark:text-white/70">
					<span>Owned: {owned}</span>
					<span>
						{equipped
							? 'Armed now'
							: item.type === 'power-up'
								? 'Manual arm'
								: 'Manual use'}
					</span>
				</div>

				<div className="grid gap-3 sm:grid-cols-2">
					<Button
						type="button"
						variant="outline"
						className="h-11 rounded-2xl"
						onClick={() => onBuy(item.id)}
						disabled={!canAfford}
					>
						<ShoppingBag className="size-4" />
						Buy
					</Button>

					{item.id === 'streak-freeze' ? (
						<Button
							type="button"
							className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
							onClick={() => onToggleEquip('streak-freeze')}
							disabled={!equipped && owned <= 0}
						>
							{equipped ? 'Disarm' : 'Arm'}
						</Button>
					) : (
						<Button
							type="button"
							className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
							onClick={() =>
								onUse(
									item.id as Extract<ShopItemId, 'heart-refill' | 'heart-snack'>
								)
							}
							disabled={!canUse}
						>
							Use now
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
