<script setup>
import { useRouter } from 'vue-router'
import { SaleItemService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import SaleItemDetail from '@/components/sale-item/SaleItemDetail.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import { loadFromLocalStorage, saveToLocalStorage } from '@/utils/StorageUtils'
import { LOCAL_STORAGE_KEYS } from '@/constants/sale-item.constant'

const router = useRouter()
const toast = useToastStore()

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', path: '/sale-items' },
  { text: 'Add', active: true },
]

const handleSubmit = async (data) => {
  try {
    console.log(' FormData before send:')
    for (const [key, value] of data.entries()) {
      console.log(`${key}:`, value)
    }

    const res = await SaleItemService.addSaleItem(data)

    if (res?.error) {
      toast.add({ message: res.message || 'Failed to save item', type: 'error' })
      return
    }

    router.push({ path: '/sale-items/list', query: { toast: 'created' } })

    const paginationState = loadFromLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION)
    saveToLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION, {
      ...paginationState,
      currentPage: 1,
    })
  } catch (err) {

    console.error('🔥 Submit error:', err)
    toast.add({ message: 'Unexpected error while saving item', type: 'error' })
  }
}
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />

  <SaleItemDetail
    :product="{}"
    mode="add"
    :on-submit="handleSubmit"
    @cancel="$router.push('/sale-items')"
  />
</template>
