import { shopCatalog } from '@/content/economy'
import { claimQuestReward } from '@/lib/domain/quests'
import {
	buyInventoryItem,
	openDailyChest as openDailyChestReward,
	openPathChest as openPathChestReward,
	togglePowerUpEquip,
	useInventoryItem as applyInventoryItem,
} from '@/lib/domain/progress'
import type { ChestReward, ShopItemId } from '@/lib/domain/models'
import type { ProgressRepository } from '@/lib/repositories/interfaces'

export type EconomyService = ReturnType<typeof createEconomyService>

export function createEconomyService(progressRepository: ProgressRepository) {
	return {
		claimQuest(questId: string) {
			return (async () => {
				const snapshot = await progressRepository.getSnapshot()
				const quest = snapshot.quests.find((entry) => entry.id === questId)
				const updated = claimQuestReward(snapshot, questId)
				await progressRepository.saveSnapshot(updated)
				await progressRepository.recordXpEvent?.({
					source: 'quest',
					amount: quest?.completed && !quest.claimed ? quest.rewardPoints : 0,
					createdAt: new Date().toISOString(),
				})
				return updated
			})()
		},
		buyShopItem(itemId: ShopItemId) {
			return (async () => {
				const item = shopCatalog.find((entry) => entry.id === itemId)

				if (!item) {
					return progressRepository.getSnapshot()
				}

				const snapshot = await progressRepository.getSnapshot()
				const updated = buyInventoryItem(snapshot, itemId, item.cost)
				await progressRepository.saveSnapshot(updated)
				return updated
			})()
		},
		useShopItem(itemId: Extract<ShopItemId, 'heart-refill' | 'heart-snack'>) {
			return (async () => {
				const snapshot = await progressRepository.getSnapshot()
				const updated = applyInventoryItem(snapshot, itemId)
				await progressRepository.saveSnapshot(updated)
				return updated
			})()
		},
		toggleEquippedItem(itemId: Extract<ShopItemId, 'streak-freeze'>) {
			return (async () => {
				const snapshot = await progressRepository.getSnapshot()
				const updated = togglePowerUpEquip(snapshot, itemId)
				await progressRepository.saveSnapshot(updated)
				return updated
			})()
		},
		openPathChest(chestId: string) {
			return (async () => {
				const snapshot = await progressRepository.getSnapshot()
				const outcome = openPathChestReward(snapshot, chestId)
				await progressRepository.saveSnapshot(outcome.snapshot)
				await progressRepository.recordXpEvent?.({
					source: 'chest',
					amount:
						outcome.reward?.rewardType === 'xp' ? outcome.reward.amount : 0,
					chestSource: outcome.reward?.source,
					createdAt: new Date().toISOString(),
				})
				return outcome as {
					snapshot: typeof outcome.snapshot
					reward: ChestReward | null
				}
			})()
		},
		openDailyChest() {
			return (async () => {
				const snapshot = await progressRepository.getSnapshot()
				const outcome = openDailyChestReward(snapshot)
				await progressRepository.saveSnapshot(outcome.snapshot)
				await progressRepository.recordXpEvent?.({
					source: 'chest',
					amount:
						outcome.reward?.rewardType === 'xp' ? outcome.reward.amount : 0,
					chestSource: outcome.reward?.source,
					createdAt: new Date().toISOString(),
				})
				return outcome as {
					snapshot: typeof outcome.snapshot
					reward: ChestReward | null
				}
			})()
		},
	}
}
