import { computed } from 'vue'
import { useCartStore } from '@/stores/cart.store'

const getSellerGroups = () => {
  const cartStore = useCartStore()
  return computed(() => {
    const groupsMap = new Map()
    for (const item of cartStore.items) {
      const nickname = item?.sellerNickname || 'Unknown'
      if (!groupsMap.has(nickname)) {
        groupsMap.set(nickname, [])
      }
      groupsMap.get(nickname).push(item)
    }
    return Array.from(groupsMap.entries()).map(([sellerNickname, items]) => ({
      sellerNickname,
      items,
    }))
  })
}

export default {
  getSellerGroups,
}
