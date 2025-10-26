<script setup>
import { useRouter } from 'vue-router'
import { SaleItemService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import SaleItemDetail from '@/components/sale-item/SaleItemDetail.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import { loadFromSessionStorage, saveToSessionStorage } from '@/utils/StorageUtils'
import { SALE_ITEM_STORAGE_KEYS } from '@/constants/sale-item.constant'

const router = useRouter()
const toast = useToastStore()

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', path: '/sale-items' },
  { text: 'Add', active: true },
]

const handleSubmit = async (data) => {
  const res = await SaleItemService.addSaleItem(data)

  if (res?.error) {
    toast.add({ message: res.message || 'Failed to save item', type: 'error' })
    return
  }

  router.push({ path: '/sale-items/list', query: { toast: 'created' } })

  const paginationState = loadFromSessionStorage(SALE_ITEM_STORAGE_KEYS.PAGINATION)
  saveToSessionStorage(SALE_ITEM_STORAGE_KEYS.PAGINATION, {
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
