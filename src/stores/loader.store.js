import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useLoaderStore = defineStore('loader', () => {
  const loadingCount = ref(0)

  const startLoading = () => {
    loadingCount.value++
  }

  const stopLoading = () => {
    if (loadingCount.value > 0) {
      loadingCount.value--
    }
  }

  const resetLoading = () => {
    loadingCount.value = 0
  }

  const isVisible = loadingCount.value > 0

  return { loadingCount, startLoading, stopLoading, resetLoading, isVisible }
})
