import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { loadFromLocalStorage, saveToLocalStorage } from '@/utils'

export const useCartStore = defineStore('cart', () => {
  const STORAGE_KEY = 'cart_items'
  const items = ref(loadFromLocalStorage(STORAGE_KEY, []))

  const addItem = (item) => {
    const existing = items.value.find((i) => i.id === item.id)
    if (existing) {
      if (existing.quantity + item.quantity <= existing.stock) {
        existing.quantity += item.quantity
      } else {
        existing.quantity = existing.stock
      }
      existing.selected = true
    } else {
      items.value.push({
        ...item,
        sellerNickname: item.sellerNickname || 'Unknown',
        selected: false,
        stock: item.stock,
      })
    }
  }

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

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  const totalPrice = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))

  const shippingAddress = ref('')
  const orderNote = ref('')

  const setShippingAddress = (address) => {
    shippingAddress.value = address
  }

  const setOrderNote = (note) => {
    orderNote.value = note
  }

  const removeItem = (id) => {
    items.value = items.value.filter((i) => i.id !== id)
  }

  const clearCart = () => {
    items.value = []
  }

  watch(
    items,
    (newVal) => {
      saveToLocalStorage(STORAGE_KEY, newVal)
    },
    { deep: true },
  )

  const increaseQty = (id) => {
    const item = items.value.find((i) => i.id === id)
    if (item && item.quantity < item.stock) {
      item.quantity++
    }
  }

  const decreaseQty = (id) => {
    const item = items.value.find((i) => i.id === id)
    if (!item) return false

    if (item.quantity > 1) {
      item.quantity--
      return true
    } else {
      // quantity = 1 แล้ว
      return false
    }
  }

  // ---------- Select item ----------
  const toggleItem = (id, value) => {
    const item = items.value.find((i) => i.id === id)
    if (item) item.selected = value
  }

  // ---------- Select seller ----------
  const toggleSeller = (sellerNickname, value) => {
    items.value.forEach((i) => {
      if (i.sellerNickname === sellerNickname) {
        i.selected = value
      }
    })
  }

  const isSellerAllSelected = (sellerNickname) => {
    const sellerItems = items.value.filter((i) => i.sellerNickname === sellerNickname)
    return sellerItems.length > 0 && sellerItems.every((i) => i.selected)
  }

  // ---------- Select all ----------
  const isAllSelected = computed(
    () => items.value.length > 0 && items.value.every((i) => i.selected),
  )

  const toggleSelectAll = (value) => {
    items.value.forEach((i) => {
      i.selected = value
    })
  }

  // ---------- Summary (เฉพาะ selected) ----------
  const selectedItems = computed(() => items.value.filter((i) => i.selected))

  const selectedTotalItems = computed(() =>
    selectedItems.value.reduce((sum, i) => sum + i.quantity, 0),
  )

  const selectedTotalPrice = computed(() =>
    selectedItems.value.reduce((sum, i) => sum + i.price * i.quantity, 0),
  )

  // ---------- Save to localStorage ----------
  watch(
    items,
    (newVal) => {
      saveToLocalStorage(STORAGE_KEY, newVal)
    },
    { deep: true },
  )

  return {
    items,
    addItem,
    removeItem,
    totalPrice,
    clearCart,
    totalItems,
    increaseQty,
    decreaseQty,
    toggleItem,
    toggleSeller,
    isSellerAllSelected,
    isAllSelected,
    toggleSelectAll,
    selectedItems,
    selectedTotalItems,
    selectedTotalPrice,
    shippingAddress,
    orderNote,
    setShippingAddress,
    setOrderNote,
    getSellerGroups,
  }
})
