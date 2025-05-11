import { defineStore } from 'pinia'
import { ref } from 'vue'

let idCounter = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  const add = ({ message, type = 'info', timeout = 3000 }) => {
    const id = ++idCounter
    toasts.value.push({ id, message, type })

    setTimeout(() => remove(id), timeout)
  }

  const remove = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, add, remove }
})