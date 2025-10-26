import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { loadFromLocalStorage, saveToLocalStorage } from '@/utils'
import { useAuthStore } from './auth.store'
import { useToastStore } from './toast.store'
import { CART_STORAGE_KEY as STORAGE_KEY, CART_TOAST_MESSAGES } from '@/constants/cart.constant'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const authStore = useAuthStore()
  const toastStore = useToastStore()

  // Helper: derive a per-user storage key so multiple accounts persist separately
  const storageKey = computed(() => {
    const uid = authStore.userInfo.id || 'guest'
    return `${STORAGE_KEY}:${uid}`
  })

  // Migrate legacy non-namespaced cart (CART_STORAGE_KEY) into per-user key once
  // const migrateLegacyCartIfNeeded = () => {
  //   try {
  //     const legacyRaw = localStorage.getItem(STORAGE_KEY)
  //     if (!legacyRaw) return
  //     const legacyItems = JSON.parse(legacyRaw)
  //     const currentItems = loadFromLocalStorage(storageKey.value, [])
  //     if (
  //       Array.isArray(legacyItems) &&
  //       (Array.isArray(currentItems) ? currentItems.length === 0 : true)
  //     ) {
  //       saveToLocalStorage(storageKey.value, legacyItems)
  //       localStorage.removeItem(STORAGE_KEY)
  //       items.value = legacyItems
  //     }
  //   } catch {
  //     // ignore migration errors
  //   }
  // }
  // migrateLegacyCartIfNeeded()

  // Re-hydrate cart when logged-in user changes (login/logout/switch account)
  watch(
    () => authStore.userInfo.id,
    () => {
      items.value = loadFromLocalStorage(storageKey.value, [])
    },
    {
      immediate: true,
    },
  )

  const addItem = (item) => {
    const userId = authStore.userInfo.id
    const sellerId = item.sellerId

    //ผู้ใช้ยังไม่ได้ login
    if (!userId) {
      toastStore.add({
        type: 'error',
        message: CART_TOAST_MESSAGES.LOGIN_REQUIRED,
      })
      return
    }

    //สินค้าไม่มี sellerId (ข้อมูลไม่ครบ)
    if (!sellerId) {
      toastStore.add({
        type: 'error',
        message: CART_TOAST_MESSAGES.MISSING_SELLER_INFO,
      })
      return
    }

    //พยายามซื้อสินค้าของตัวเอง
    if (sellerId && sellerId === userId) {
      toastStore.add({
        type: 'error',
        message: CART_TOAST_MESSAGES.OWNER_ERROR,
      })
      return
    }

    if (item.stock === 0) {
      toastStore.add({
        type: 'error',
        message: CART_TOAST_MESSAGES.OUT_OF_STOCK,
      })
      return
    }

    const existing = items.value.find((i) => i.id === item.id)
    if (existing) {
      if (existing.quantity + item.quantity <= existing.stock) {
        existing.quantity += item.quantity
        toastStore.add({
          type: 'success',
          message: CART_TOAST_MESSAGES.ADD_SUCCESS,
        })
      } else {
        toastStore.add({
          type: 'warn',
          message: CART_TOAST_MESSAGES.QUANTITY_EXCEEDS,
        })
        existing.quantity = existing.stock
      }
    } else {
      items.value.push({
        ...item,
        sellerId: sellerId,
        sellerNickname: item.sellerNickname || 'Unknown',
        brand: item.brand,
        selected: false,
        stock: item.stock,
        storageGb: item.storageGb,
        color: item.color,
      })
      toastStore.add({
        type: 'success',
        message: CART_TOAST_MESSAGES.ADD_SUCCESS,
      })
    }
  }

  const getSellerGroups = () => {
    return computed(() => {
      const groupsMap = new Map()
      for (const item of items.value) {
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
    // Persist clear for current user
    saveToLocalStorage(storageKey.value, items.value)
  }

  watch(
    items,
    (newVal) => {
      // Persist to the current user's cart bucket
      saveToLocalStorage(storageKey.value, newVal)
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

  // ---------- Place order ----------
  const placeOrder = () => {
    // ลบเฉพาะสินค้าที่ถูกเลือก
    items.value = items.value.filter((i) => !i.selected)

    // เซฟกลับ localStorage
    saveToLocalStorage(storageKey.value, items.value)
  }

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
    placeOrder,
  }
})
