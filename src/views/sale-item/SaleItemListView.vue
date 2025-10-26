<script setup>
import { ref, onMounted, watchEffect, computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XButton from '@/components/common/XButton.vue'
import XList from '@/components/common/XList.vue'
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

const headerButtons = computed(() => [
  {
    label: 'Add Sale Item',
    variant: 'outline',
    size: 'md',
    className:
      'itbms-sale-item-add bg-emerald-500 text-white border-white hover:bg-emerald-700 transition-all duration-200',
    onClick: onAdd,
  },
  {
    label: 'Manage Brand',
    variant: 'outline',
    size: 'md',
    className:
      'itbms-manage-brand bg-emerald-500 text-white border-white hover:bg-emerald-700 transition-all duration-200',
    onClick: onManage,
  },
])

const statsData = computed(() => [
  {
    showPulse: true,
    label: `Total Items: ${searchOptions.totalItems}`,
  },
  {
    showPulse: false,
    label: `Page: ${searchOptions.currentPage}`,
  },
])

const paginationData = computed(() => ({
  currentPage: searchOptions.currentPage,
  pageSize: searchOptions.pageSize,
  total: searchOptions.totalItems,
}))

const initializeStateFromRouteOrStorage = () => {
  const q = route.query

  // Pagination
  searchOptions.currentPage =
    parseInt(q.page, 10) ||
    loadFromSessionStorage(SALE_ITEM_STORAGE_KEYS.PAGINATION, {}).currentPage ||
    1
  searchOptions.pageSize =
    parseInt(q.size, 10) ||
    loadFromSessionStorage(SALE_ITEM_STORAGE_KEYS.PAGINATION, {}).pageSize ||
    10

  // Sort
  searchOptions.sortBy =
    q.sortBy || loadFromSessionStorage(SALE_ITEM_STORAGE_KEYS.SORT, {}).field || 'createdOn'
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
  const sellerId = authStore.userInfo.id
  if (!sellerId) return

  loading.items = true
  error.items = null

  const response = await SaleItemService.getSaleItemListBySellerId(sellerId, searchParams.value)

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

  const index = saleItems.findIndex((item) => item.id === id)
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
  <div class="min-h-screen bg-gradient-to-br">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <XBreadcrumb :items="breadcrumbs" />
      </div>

      <!-- List View Wrapper -->
      <XList
        title="Sale Items Management"
        subtitle="Manage your inventory and product listings"
        :buttons="headerButtons"
        :stats="statsData"
        :loading="loading.items"
        loading-text="Loading sale items..."
        empty-text="No sale items found. Start by adding your first item!"
        :columns="columns"
        :data="saleItems"
        :pagination="paginationData"
        :show-size-changer="true"
        @pagination-change="handlePaginationChange"
      >
        <!-- Format ราคาด้วย comma -->
        <template #itbms-price="{ record }">
          <span class="font-semibold text-emerald-600">
            {{ formatPrice(record.price) }}
          </span>
        </template>

        <!-- Show RAM หรือ '-' -->
        <template #itbms-ramGb="{ record }">
          <span class="text-slate-700">
            {{ displayOrDash(record.ramGb) }}
          </span>
        </template>

        <!-- Show Storage หรือ '-' -->
        <template #itbms-storageGb="{ record }">
          <span class="text-slate-700">
            {{ displayOrDash(record.storageGb) }}
          </span>
        </template>

        <!-- Show สี หรือ '-' -->
        <template #itbms-color="{ record }">
          <span class="text-slate-700">{{ record.color }}</span>
        </template>

        <!-- ปุ่ม Edit/Delete -->
        <template #actions="{ record }">
          <div class="flex gap-2">
            <XButton
              size="sm"
              variant="outline"
              class-name="itbms-edit-button hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-600 transition-all duration-200"
              label="Edit"
              @click="editSaleItem(record.id)"
            />
            <XButton
              size="sm"
              variant="danger"
              class-name="itbms-delete-button hover:bg-red-600 hover:shadow-md transition-all duration-200"
              label="Delete"
              @click="askDeleteItem(record)"
            />
          </div>
        </template>
      </XList>
    </div>
  </div>

  <XConfirmModal
    v-model="showConfirm"
    title="Delete Sale Item"
    message="Do you want to delete this sale item?"
    type="error"
    @confirm="confirmDeleteItem"
  />
</template>
