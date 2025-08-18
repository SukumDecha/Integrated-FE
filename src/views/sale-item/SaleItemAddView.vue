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
  const res = await SaleItemService.addSaleItem(data)
  if (res.error) {
    toast.add({ message: 'Failed to save item', type: 'error' })
    throw new Error('Backend error')
  } else {
    router.push({ path: '/sale-items/list', query: { toast: 'created' } })
  }

  const paginationState = loadFromLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION)

  saveToLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION, {
    ...paginationState,
    currentPage: 1,
  })
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
