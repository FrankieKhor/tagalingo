import { Coins, Heart, Shield, ShoppingBag, Sparkles, Zap } from 'lucide-react'

import { shopCatalog } from '@/content/economy'
import { PageHeader } from '@/components/common/page-header'
import { ShopItemCard } from '@/components/shop/shop-item-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ShopItem, ShopItemId } from '@/lib/domain/models'
import { useAppStore } from '@/store/use-app-store'

const sectionLabels: Record<ShopItemId, string> = {
	'heart-refill': 'Hearts',
	'heart-snack': 'Boosts',
	'streak-freeze': 'Streak Safety',
}

function getItemActionState({
	item,
	owned,
	equipped,
	canAfford,
	canUse,
	hearts,
	points,
}: {
	item: ShopItem
	owned: number
	equipped: boolean
	canAfford: boolean
	canUse: boolean
	hearts: number
	points: number
}) {
	if (item.id === 'streak-freeze' && equipped) {
		return 'Armed'
	}

	if (item.id !== 'streak-freeze' && hearts >= 5) {
		return 'Full'
	}

	if (!canAfford && owned === 0) {
		return `Need ${item.cost - points} more pts`
	}

	if (owned > 0 && item.id === 'streak-freeze') {
		return 'Ready to arm'
	}

	if (owned > 0 && canUse) {
		return 'Ready to use'
	}

	return 'Available'
}

export function ShopPage() {
	const snapshot = useAppStore((state) => state.snapshot)
	const buyShopItem = useAppStore((state) => state.buyShopItem)
	const applyShopItem = useAppStore((state) => state.useShopItem)
	const toggleEquippedItem = useAppStore((state) => state.toggleEquippedItem)
	const featuredItem = shopCatalog.find((item) => item.id === 'streak-freeze')
	const groupedItems = shopCatalog.filter((item) => item.id !== 'streak-freeze')
	const freezeOwned = snapshot.inventory['streak-freeze'] ?? 0
	const freezeEquipped = snapshot.equippedPowerUps.includes('streak-freeze')
	const canAffordFreeze = featuredItem
		? snapshot.profile.points >= featuredItem.cost
		: false

	return (
		<div className="space-y-5">
			<PageHeader
				eyebrow="Shop"
				title="Power-ups for steady learning"
				description="Spend quest points on focused safety nets and recovery tools when they are useful."
				action={
					<div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
						<Coins className="size-4" />
						{snapshot.profile.points} pts
					</div>
				}
			/>

			<section aria-label="Shop status" className="grid gap-3 sm:grid-cols-3">
				<div className="flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/90 px-4 py-3 text-amber-800 shadow-sm dark:border-amber-400/15 dark:bg-amber-500/10 dark:text-amber-200">
					<div className="grid size-10 place-items-center rounded-xl bg-white/75 dark:bg-white/10">
						<Coins className="size-5" />
					</div>
					<div>
						<p className="text-xs font-black uppercase tracking-[0.16em]">
							Wallet
						</p>
						<p className="text-lg font-black">{snapshot.profile.points} pts</p>
					</div>
				</div>

				<div className="flex items-center gap-3 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-rose-800 shadow-sm dark:border-rose-400/15 dark:bg-rose-500/10 dark:text-rose-200">
					<div className="grid size-10 place-items-center rounded-xl bg-white/75 dark:bg-white/10">
						<Heart className="size-5" />
					</div>
					<div>
						<p className="text-xs font-black uppercase tracking-[0.16em]">
							Hearts
						</p>
						<p className="text-lg font-black">
							{snapshot.profile.hearts}/5 full
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3 rounded-2xl border border-cyan-200/70 bg-cyan-50/80 px-4 py-3 text-cyan-900 shadow-sm dark:border-cyan-400/15 dark:bg-cyan-500/10 dark:text-cyan-200">
					<div className="grid size-10 place-items-center rounded-xl bg-white/75 dark:bg-white/10">
						<Shield className="size-5" />
					</div>
					<div>
						<p className="text-xs font-black uppercase tracking-[0.16em]">
							Streak safety
						</p>
						<p className="text-lg font-black">
							{freezeEquipped ? 'Freeze armed' : 'No freeze armed'}
						</p>
					</div>
				</div>
			</section>

			{featuredItem ? (
				<Card className="overflow-hidden border-cyan-200/70 bg-white/90 shadow-[0_24px_80px_-44px_rgba(14,165,233,0.45)] dark:border-cyan-400/15 dark:bg-[#13212a]/95 dark:shadow-none">
					<CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
						<div className="flex flex-col gap-5 sm:flex-row sm:items-start">
							<div className="grid size-16 shrink-0 place-items-center rounded-2xl border border-cyan-200/70 bg-cyan-50 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-200">
								<Shield className="size-8" />
							</div>

							<div className="max-w-2xl space-y-3">
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="secondary">Featured utility</Badge>
									<Badge variant="outline">Owned: {freezeOwned}</Badge>
									<Badge variant={freezeEquipped ? 'default' : 'outline'}>
										{freezeEquipped ? 'Armed' : 'Manual arm'}
									</Badge>
								</div>
								<div className="space-y-2">
									<h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
										{featuredItem.name}
									</h2>
									<p className="text-sm leading-6 text-slate-600 dark:text-white/70">
										{featuredItem.description} Keep one ready for the next time
										life interrupts your lesson streak.
									</p>
								</div>
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-[auto_1fr] lg:min-w-72 lg:grid-cols-1">
							<div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
								<span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-white/50">
									Price
								</span>
								<span className="font-black text-amber-700 dark:text-amber-200">
									{featuredItem.cost} pts
								</span>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<Button
									type="button"
									className="h-11 rounded-xl bg-emerald-500 font-black text-white hover:bg-emerald-400 dark:text-slate-950"
									onClick={() => void buyShopItem(featuredItem.id)}
									disabled={!canAffordFreeze}
								>
									<ShoppingBag className="size-4" />
									Buy
								</Button>
								<Button
									type="button"
									variant="outline"
									className="h-11 rounded-xl"
									onClick={() => void toggleEquippedItem('streak-freeze')}
									disabled={!freezeEquipped && freezeOwned <= 0}
								>
									{freezeEquipped ? 'Disarm' : 'Arm'}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			) : null}

			<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
				<section className="space-y-5" aria-label="Shop items">
					<div className="space-y-3">
						<div className="flex items-center justify-between gap-3">
							<div>
								<h2 className="text-lg font-black text-slate-950 dark:text-white">
									Hearts
								</h2>
								<p className="text-sm text-slate-600 dark:text-white/60">
									Recover mistakes only when you need the extra room.
								</p>
							</div>
							<Coins className="size-5" />
						</div>
						<div className="space-y-3">
							{groupedItems
								.filter((item) => sectionLabels[item.id] === 'Hearts')
								.map((item) => {
									const owned = snapshot.inventory[item.id] ?? 0
									const equipped = snapshot.equippedPowerUps.includes(item.id)

									return (
										<ShopItemCard
											key={item.id}
											item={item}
											owned={owned}
											equipped={equipped}
											canAfford={snapshot.profile.points >= item.cost}
											canUse={owned > 0 && snapshot.profile.hearts < 5}
											points={snapshot.profile.points}
											sectionLabel={sectionLabels[item.id]}
											onBuy={(itemId) => void buyShopItem(itemId)}
											onUse={(itemId) => void applyShopItem(itemId)}
											onToggleEquip={(itemId) =>
												void toggleEquippedItem(itemId)
											}
										/>
									)
								})}
						</div>
					</div>

					<div className="space-y-3">
						<div>
							<h2 className="text-lg font-black text-slate-950 dark:text-white">
								Boosts
							</h2>
							<p className="text-sm text-slate-600 dark:text-white/60">
								Small recovery tools that stay in your inventory.
							</p>
						</div>
						<div className="space-y-3">
							{groupedItems
								.filter((item) => sectionLabels[item.id] === 'Boosts')
								.map((item) => {
									const owned = snapshot.inventory[item.id] ?? 0
									const equipped = snapshot.equippedPowerUps.includes(item.id)

									return (
										<ShopItemCard
											key={item.id}
											item={item}
											owned={owned}
											equipped={equipped}
											canAfford={snapshot.profile.points >= item.cost}
											canUse={owned > 0 && snapshot.profile.hearts < 5}
											points={snapshot.profile.points}
											sectionLabel={sectionLabels[item.id]}
											onBuy={(itemId) => void buyShopItem(itemId)}
											onUse={(itemId) => void applyShopItem(itemId)}
											onToggleEquip={(itemId) =>
												void toggleEquippedItem(itemId)
											}
										/>
									)
								})}
						</div>
					</div>
				</section>

				<aside className="space-y-4">
					<Card className="border-emerald-200/70 bg-white/85 shadow-sm dark:border-emerald-400/15 dark:bg-[#13212a]/90">
						<CardContent className="space-y-4 p-5">
							<div className="flex items-center gap-3">
								<div className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
									<Sparkles className="size-5" />
								</div>
								<div>
									<p className="text-sm font-black text-slate-950 dark:text-white">
										Recommended
									</p>
									<p className="text-xs text-slate-600 dark:text-white/60">
										Based on your current setup
									</p>
								</div>
							</div>
							<div className="space-y-2">
								<p className="text-lg font-black text-slate-950 dark:text-white">
									{freezeEquipped
										? 'Keep hearts topped up'
										: 'Arm streak safety'}
								</p>
								<p className="text-sm leading-6 text-slate-600 dark:text-white/70">
									{freezeEquipped
										? 'You already have streak coverage. Save a refill for harder lessons.'
										: 'A single freeze is the most useful backup before a busy week.'}
								</p>
							</div>
							<Button
								type="button"
								className="h-11 w-full rounded-xl bg-emerald-500 font-black text-white hover:bg-emerald-400 dark:text-slate-950"
								onClick={() => void buyShopItem('streak-freeze')}
								disabled={!featuredItem || !canAffordFreeze}
							>
								<ShoppingBag className="size-4" />
								Buy Streak Freeze
							</Button>
						</CardContent>
					</Card>

					<Card className="border-slate-200/80 bg-white/80 shadow-sm dark:border-white/10 dark:bg-[#13212a]/80">
						<CardContent className="space-y-4 p-5">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-black text-slate-950 dark:text-white">
										Inventory
									</p>
									<p className="text-xs text-slate-600 dark:text-white/60">
										Items stay here until used.
									</p>
								</div>
								<Zap className="size-5 text-amber-500" />
							</div>

							<div className="space-y-3">
								{shopCatalog.map((item) => {
									const owned = snapshot.inventory[item.id] ?? 0
									const equipped = snapshot.equippedPowerUps.includes(item.id)
									const canAfford = snapshot.profile.points >= item.cost
									const canUse = owned > 0 && snapshot.profile.hearts < 5

									return (
										<div
											key={item.id}
											className="flex items-center justify-between gap-3 text-sm"
										>
											<span className="font-semibold text-slate-700 dark:text-white/75">
												{item.name}
											</span>
											<span className="text-right text-xs font-black uppercase tracking-[0.12em] text-slate-500 dark:text-white/45">
												{getItemActionState({
													item,
													owned,
													equipped,
													canAfford,
													canUse,
													hearts: snapshot.profile.hearts,
													points: snapshot.profile.points,
												})}
											</span>
										</div>
									)
								})}
							</div>
						</CardContent>
					</Card>
				</aside>
			</div>
		</div>
	)
}
