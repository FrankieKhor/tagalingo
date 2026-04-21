import { shopCatalog } from "@/content/economy"
import { claimQuestReward } from "@/lib/domain/quests"
import {
  buyInventoryItem,
  openDailyChest as openDailyChestReward,
  openPathChest as openPathChestReward,
  togglePowerUpEquip,
  useInventoryItem,
} from "@/lib/domain/progress"
import type { ChestReward, ShopItemId } from "@/lib/domain/models"
import type { ProgressRepository } from "@/lib/repositories/interfaces"

export type EconomyService = ReturnType<typeof createEconomyService>

export function createEconomyService(progressRepository: ProgressRepository) {
  return {
    claimQuest(questId: string) {
      const snapshot = progressRepository.getSnapshot()
      const updated = claimQuestReward(snapshot, questId)
      progressRepository.saveSnapshot(updated)
      return updated
    },
    buyShopItem(itemId: ShopItemId) {
      const item = shopCatalog.find((entry) => entry.id === itemId)

      if (!item) {
        return progressRepository.getSnapshot()
      }

      const snapshot = progressRepository.getSnapshot()
      const updated = buyInventoryItem(snapshot, itemId, item.cost)
      progressRepository.saveSnapshot(updated)
      return updated
    },
    useShopItem(itemId: Extract<ShopItemId, "heart-refill" | "heart-snack">) {
      const snapshot = progressRepository.getSnapshot()
      const updated = useInventoryItem(snapshot, itemId)
      progressRepository.saveSnapshot(updated)
      return updated
    },
    toggleEquippedItem(itemId: Extract<ShopItemId, "streak-freeze">) {
      const snapshot = progressRepository.getSnapshot()
      const updated = togglePowerUpEquip(snapshot, itemId)
      progressRepository.saveSnapshot(updated)
      return updated
    },
    openPathChest(chestId: string) {
      const snapshot = progressRepository.getSnapshot()
      const outcome = openPathChestReward(snapshot, chestId)
      progressRepository.saveSnapshot(outcome.snapshot)
      return outcome as { snapshot: typeof outcome.snapshot; reward: ChestReward | null }
    },
    openDailyChest() {
      const snapshot = progressRepository.getSnapshot()
      const outcome = openDailyChestReward(snapshot)
      progressRepository.saveSnapshot(outcome.snapshot)
      return outcome as { snapshot: typeof outcome.snapshot; reward: ChestReward | null }
    },
  }
}
