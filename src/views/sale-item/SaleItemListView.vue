<script setup>
import { ref, onMounted, watchEffect, computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XButton from '@/components/common/XButton.vue'
import XTable from '@/components/common/XTable.vue'
import XPagination from '@/components/common/XPagination.vue'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'
import { SaleItemService } from '@/services'
import { formatPrice, displayOrDash } from '@/utils/TextUtils'
import { useToastStore } from '@/stores/toast.store'
import { useAuthStore } from '@/stores/auth.store'
import { loadFromSessionStorage, saveToSessionStorage } from '@/utils/StorageUtils'
import { SALE_ITEM_STORAGE_KEYS } from '@/constants/sale-item.constant'

const router = useRouter()
const route = useRoute()
const toast = useToastStore()
const authStore = useAuthStore()

const saleItems = reactive([])

const itemToDelete = ref(null)
const showConfirm = ref(false)

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', path: '/sale-items', active: true },
]

const columns = [
  { title: 'ID', key: 'itbms-id', dataIndex: 'id' },
  { title: 'Brand', key: 'itbms-brand', dataIndex: 'brandName' },
  { title: 'Model', key: 'itbms-model', dataIndex: 'model' },
  { title: 'RAM (GB)', key: 'itbms-ramGb', dataIndex: 'ramGb' },
  { title: 'Storage (GB)', key: 'itbms-storageGb', dataIndex: 'storageGb' },
  { title: 'Color', key: 'itbms-color', dataIndex: 'color' },
  { title: 'Price (Baht)', key: 'itbms-price', dataIndex: 'price' },
  { title: 'Actions', key: 'actions', dataIndex: 'actions' },
]

const searchOptions = reactive({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  sortBy: 'createdOn',
  sortOrder: 'asc',
})

const loading = reactive({
  items: true,
})

const error = reactive({
  items: null,
})

const searchParams = computed(() => {
  return {
    page: searchOptions.currentPage - 1,
    size: searchOptions.pageSize,
    sortBy: searchOptions.sortBy,
    sortDirection: searchOptions.sortOrder,
  }
})

const initializeStateFromRouteOrStorage = () => {
  const q = route.query

  // Pagination
  searchOptions.currentPage =
    parseInt(q.page, 10) || loadFromSessionStorage(SALE_ITEM_STORAGE_KEYS.PAGINATION, {}).currentPage || 1
  searchOptions.pageSize =
    parseInt(q.size, 10) || loadFromSessionStorage(SALE_ITEM_STORAGE_KEYS.PAGINATION, {}).pageSize || 10

  // Sort
  searchOptions.sortBy = q.sortBy || loadFromSessionStorage(SALE_ITEM_STORAGE_KEYS.SORT, {}).field || 'createdOn'
  searchOptions.sortOrder =
    q.sortDirection || loadFromSessionStorage(SALE_ITEM_STORAGE_KEYS.SORT, {}).order || 'asc'

  updateRouteQuery()
}

const updateRouteQuery = () => {
  const query = {}

  if (searchOptions.currentPage) query.page = searchOptions.currentPage
  if (searchOptions.pageSize) query.size = searchOptions.pageSize
  if (searchOptions.sortBy) query.sortBy = searchOptions.sortBy
  if (searchOptions.sortOrder) query.sortDirection = searchOptions.sortOrder

  router.replace({ query })
}

const fetchSaleItems = async () => {
  const sellerId = authStore.user?.id
  if (!sellerId) return

  loading.items = true
  error.items = null

  const response = await SaleItemService.getSaleItemListBySellerId(
    sellerId,
    searchParams.value
  )

  if (response.error) {
    error.items = response.error.message || 'Failed to load sale items. Please try again later.'
    toast.add({
      type: 'error',
      message: error.items,
    })
    loading.items = false
    return
  }

  saleItems.splice(0, saleItems.length)
  saleItems.push(...response.data)
  searchOptions.totalItems = response.pagination.totalItems
  loading.items = false
}

const handlePaginationChange = async ({ currentPage, pageSize }) => {
  const oldCurrentPage = searchOptions.currentPage

  searchOptions.currentPage = currentPage
  searchOptions.pageSize = pageSize

  if (oldCurrentPage === currentPage) {
    await fetchSaleItems()
  }

  saveToSessionStorage(SALE_ITEM_STORAGE_KEYS.PAGINATION, { currentPage, pageSize })
}

onMounted(async () => {
  initializeStateFromRouteOrStorage()
  await fetchSaleItems()
})

watchEffect(() => {
  if (route.query.toast === 'created') {
    toast.add({ message: 'The sale item has been successfully added.', type: 'success' })

    const newQuery = { ...route.query }
    delete newQuery.toast
    router.replace({ query: newQuery })
  }
})

watchEffect(async () => {
  updateRouteQuery()
  await fetchSaleItems()
})

function editSaleItem(id) {
  router.push(`/sale-items/${id}/edit`)
}

function askDeleteItem(item) {
  itemToDelete.value = item
  showConfirm.value = true
}

async function confirmDeleteItem() {
  if (!itemToDelete.value) return

  const id = itemToDelete.value.id

  const res = await SaleItemService.deleteSaleItem(id)

  if (res.error) {
    toast.add({ message: 'Failed to delete sale item.', type: 'error' })
    return
  }

  const index = saleItems.findIndex(item => item.id === id)
  if (index !== -1) {
    saleItems.splice(index, 1)
    searchOptions.totalItems -= 1
  }

  toast.add({ message: 'The sale item has been deleted.', type: 'success' })

  itemToDelete.value = null
  showConfirm.value = false

  // Reset to first page if current page is now empty
  if (saleItems.length === 0 && searchOptions.currentPage > 1) {
    searchOptions.currentPage = 1
    saveToSessionStorage(SALE_ITEM_STORAGE_KEYS.PAGINATION, {
      currentPage: 1,
      pageSize: searchOptions.pageSize,
    })
  }
}

function onAdd() {
  router.push('/sale-items/add')
}

function onManage() {
  router.push('/brands')
}
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />

  <div class="flex justify-between items-center mb-4">
    <XButton
      label="Add Sale Item"
      variant="primary"
      size="md"
      class-name="itbms-sale-item-add"
      @click="onAdd"
    />
    <XButton
      label="Manage Brand"
      variant="outline"
      size="md"
      class-name="itbms-manage-brand"
      @click="onManage"
    />
  </div>

  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">
      Sale Item Table
    </h1>

    <XTable
      :columns="columns"
      :data="saleItems"
      empty-text="No sale item"
    >
      <!-- Format ราคาด้วย comma -->
      <template #itbms-price="{ record }">
        {{ formatPrice(record.price) }}
      </template>

      <!-- Show RAM หรือ '-' -->
      <template #itbms-ramGb="{ record }">
        {{ displayOrDash(record.ramGb) }}
      </template>

      <!-- Show Storage หรือ '-' -->
      <template #itbms-storageGb="{ record }">
        {{ displayOrDash(record.storageGb) }}
      </template>

      <!-- Show สี หรือ '-' -->
      <template #itbms-color="{ record }">
        {{ displayOrDash(record.color) }}
      </template>

      <!-- ปุ่ม Edit/Delete -->
      <template #actions="{ record }">
        <div class="flex space-x-2">
          <XButton
            size="sm"
            variant="outline"
            class-name="itbms-edit-button"
            label="Edit"
            @click="editSaleItem(record.id)"
          />
          <XButton
            size="sm"
            variant="danger"
            class-name="itbms-delete-button"
            label="Delete"
            @click="askDeleteItem(record)"
          />
        </div>
      </template>
    </XTable>

    <!-- Pagination Component -->
    <XPagination
      v-if="!loading.items && saleItems.length > 0"
      class="mt-8"
      :pagination="{
        currentPage: searchOptions.currentPage,
        pageSize: searchOptions.pageSize,
        total: searchOptions.totalItems,
      }"
      :show-size-changer="true"
      @change="handlePaginationChange"
    />

    <!-- No items message -->
    <div
      v-if="!loading.items && saleItems.length === 0 && !error.items"
      class="text-center py-10"
    >
      <p class="text-lg text-gray-500">
        No sale item
      </p>
    </div>

    <!-- Error message -->
    <div
      v-if="error.items"
      class="text-center py-10"
    >
      <p class="text-lg text-red-500">
        {{ error.items }}
      </p>
    </div>
  </div>

  <XConfirmModal
    v-model="showConfirm"
    title="Delete Sale Item"
    message="Do you want to delete this sale item?"
    @confirm="confirmDeleteItem"
  />
</template>
