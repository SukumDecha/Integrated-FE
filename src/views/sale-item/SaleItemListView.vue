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
  <div class="min-h-screen bg-gradient-to-br ">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <XBreadcrumb :items="breadcrumbs" />
      </div>

      <!-- Header Card -->
      <div class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
        <div class="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-white mb-2">
                Sale Items Management
              </h1>
              <p class="text-emerald-100 text-sm">
                Manage your inventory and product listings
              </p>
            </div>
            <div class="flex gap-3">
              <XButton
                label="Add Sale Item"
                variant="outline"
                size="md"
                class-name="itbms-sale-item-add bg-emerald-500 text-white border-white hover:bg-emerald-700 transition-all duration-200"
                @click="onAdd"
              />
              <XButton
                label="Manage Brand"
                variant="outline"
                size="md"
                class-name="itbms-manage-brand bg-emerald-500 text-white border-white hover:bg-emerald-700 transition-all duration-200"
                @click="onManage"
              />
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="bg-gradient-to-r from-slate-50 to-emerald-50 px-8 py-4 border-b border-slate-200">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-slate-600">
                Total Items: <span class="font-semibold text-slate-900">{{ searchOptions.totalItems }}</span>
              </span>
            </div>
            <div class="w-px h-4 bg-slate-300"></div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-600">
                Page: <span class="font-semibold text-slate-900">{{ searchOptions.currentPage }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Table Container -->
        <div class="p-8">
          <!-- Loading State -->
          <div v-if="loading.items" class="text-center py-16">
            <div class="inline-block">
              <div class="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p class="mt-4 text-slate-600 font-medium">Loading sale items...</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error.items" class="text-center py-16">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p class="text-lg text-red-600 font-semibold mb-2">{{ error.items }}</p>
            <p class="text-sm text-slate-500">Please try again or contact support</p>
          </div>

          <!-- Table -->
          <div v-else class="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <XTable
              :columns="columns"
              :data="saleItems"
              empty-text="No sale items found. Start by adding your first item!"
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
                <span v-if="record.color" class="inline-flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full border-2 border-slate-300" :style="{ backgroundColor: record.color }"></span>
                  <span class="text-slate-700">{{ record.color }}</span>
                </span>
                <span v-else class="text-slate-400">-</span>
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
            </XTable>
          </div>

          <!-- Pagination -->
          <div v-if="!loading.items && saleItems.length > 0" class="mt-8">
            <XPagination
              :pagination="{
                currentPage: searchOptions.currentPage,
                pageSize: searchOptions.pageSize,
                total: searchOptions.totalItems,
              }"
              :show-size-changer="true"
              @change="handlePaginationChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <XConfirmModal
    v-model="showConfirm"
    title="Delete Sale Item"
    message="Do you want to delete this sale item?"
    @confirm="confirmDeleteItem"
  />
</template>
