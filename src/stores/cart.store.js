import { defineStore } from 'pinia'
import { ref , computed, watch } from 'vue'
import { loadFromLocalStorage, saveToLocalStorage } from '@/utils'

export const useCartStore = defineStore('cart', () => {
  const STORAGE_KEY = 'cart_items'
  const items = ref(loadFromLocalStorage(STORAGE_KEY, []))

  const addItem = (item) => {
    const existing = items.value.find(i => i.id === item.id)
     if (existing) {
    existing.quantity += item.quantity
  } else {
    items.value.push({ ...item })
  }
  }

    const totalItems = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  const removeItem = (id) => {
    items.value = items.value.filter(i => i.id !== id)
  }

  const clearCart = () => {
    items.value = []
  }

  watch(items, (newVal) => {
    saveToLocalStorage(STORAGE_KEY, newVal)
  }, { deep: true })
  

  return { items, addItem, removeItem, clearCart, totalItems  }
})