import { Coins, Heart, Shield } from "lucide-react"

import { shopCatalog } from "@/content/economy"
import { PageHeader } from "@/components/common/page-header"
import { ShopItemCard } from "@/components/shop/shop-item-card"
import { Card, CardContent } from "@/components/ui/card"
import { useAppStore } from "@/store/use-app-store"

export function ShopPage() {
  const snapshot = useAppStore((state) => state.snapshot)
  const buyShopItem = useAppStore((state) => state.buyShopItem)
  const useShopItem = useAppStore((state) => state.useShopItem)
  const toggleEquippedItem = useAppStore((state) => state.toggleEquippedItem)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Shop"
        title="Power-up shop"
        description="Spend quest points on small safety nets and recovery tools that help you keep learning."
        action={
          <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
            {snapshot.profile.points} pts
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-amber-100/80 bg-white/80 text-slate-900 shadow-[0_18px_60px_-32px_rgba(245,158,11,0.24)] dark:border-white/10 dark:bg-[#13212a] dark:text-white dark:shadow-none">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
              <Coins className="size-5" />
              <p className="text-sm font-black uppercase tracking-[0.16em]">Points wallet</p>
            </div>
            <p className="text-4xl font-black">{snapshot.profile.points}</p>
            <p className="text-sm leading-6 text-slate-600 dark:text-white/75">
              Claim quest rewards to fund the shop.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-rose-500">
              <Heart className="size-5" />
              <p className="text-sm font-black uppercase tracking-[0.16em]">Hearts</p>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white">{snapshot.profile.hearts}/5</p>
            <p className="text-sm leading-6 text-slate-600 dark:text-white/70">
              Use refill items only when you need them. They stay in inventory until then.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300">
              <Shield className="size-5" />
              <p className="text-sm font-black uppercase tracking-[0.16em]">Streak safety</p>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {snapshot.equippedPowerUps.includes("streak-freeze") ? "Freeze armed" : "No freeze armed"}
            </p>
            <p className="text-sm leading-6 text-slate-600 dark:text-white/70">
              Arm one streak freeze to cover the next single missed day.
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {shopCatalog.map((item) => {
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
              onBuy={buyShopItem}
              onUse={useShopItem}
              onToggleEquip={toggleEquippedItem}
            />
          )
        })}
      </div>
    </div>
  )
}
