<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XPagination from '@/components/common/XPagination.vue'
import { useToastStore } from '@/stores/toast.store'
import { useAuthStore } from '@/stores/auth.store'
import { OrderService } from '@/services'
import { loadFromSessionStorage, saveToSessionStorage } from '@/utils/StorageUtils'

const router = useRouter()
const route = useRoute()
const toast = useToastStore()
const authStore = useAuthStore()

const ORDER_STORAGE_KEYS = {
  PAGINATION: 'ORDER_HISTORY_PAGINATION',
  SORT: 'ORDER_HISTORY_SORT'
}

const orders = ref([])
const groupedOrders = computed(() => {
  return orders.value.reduce((acc, order) => {
    const seller = order.seller?.nickname || 'Unknown'
    if (!acc[seller]) acc[seller] = []
    acc[seller].push(order)
    return acc
  }, {})
})

const loading = reactive({ orders: true })
const error = reactive({ orders: null })

const searchOptions = reactive({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  sortBy: 'createdOn',
  sortOrder: 'desc'
})

const searchParams = computed(() => ({
  page: searchOptions.currentPage - 1,
  size: searchOptions.pageSize,
  sortBy: searchOptions.sortBy,
  sortDirection: searchOptions.sortOrder
}))

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Your Orders', path: '/your-orders', active: true }
]

const initializeState = () => {
  const q = route.query
  const storedPage = loadFromSessionStorage(ORDER_STORAGE_KEYS.PAGINATION, {})
  const storedSort = loadFromSessionStorage(ORDER_STORAGE_KEYS.SORT, {})

  searchOptions.currentPage = parseInt(q.page) || storedPage.currentPage || 1
  searchOptions.pageSize = parseInt(q.size) || storedPage.pageSize || 10
  searchOptions.sortBy = q.sortBy || storedSort.field || 'createdOn'
  searchOptions.sortOrder = q.sortDirection || storedSort.order || 'desc'
  updateRouteQuery()
}

const updateRouteQuery = () => {
  router.replace({ query: { ...searchParams.value, page: searchOptions.currentPage } })
}

const fetchOrders = async () => {
  const userId = authStore.user?.id
  if (!userId) return

  loading.orders = true
  error.orders = null

  const response = await OrderService.getOrderById(userId, searchParams.value)
  if (response.error) {
    error.orders = response.error.message || 'Failed to load order history.'
    toast.add({ type: 'error', message: error.orders })
  } else {
    orders.value = response.data.content || []
    searchOptions.totalItems = response.data.pagination?.totalItems || 0
  }
  loading.orders = false
}

const handlePaginationChange = async ({ currentPage, pageSize }) => {
  const oldPage = searchOptions.currentPage
  searchOptions.currentPage = currentPage
  searchOptions.pageSize = pageSize

  if (oldPage === currentPage) await fetchOrders()

  saveToSessionStorage(ORDER_STORAGE_KEYS.PAGINATION, { currentPage, pageSize })
}

onMounted(async () => {
  initializeState()
  await fetchOrders()
})

watch(
  () => [
    searchOptions.currentPage,
    searchOptions.pageSize,
    searchOptions.sortBy,
    searchOptions.sortOrder
  ],
  updateRouteQuery
)

const formatDate = d => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'
const formatCurrency = n => n?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'
const calculateTotalPrice = order => order?.orderItems?.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0)
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-semibold text-green-700 mb-6">Your Orders</h1>

    <div v-for="(sellerOrders, sellerName) in groupedOrders" :key="sellerName" class="space-y-6">
      <div v-for="order in sellerOrders" :key="order.id" class="border border-green-200 p-4 rounded-xl shadow-sm">
        <div class="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div class="font-semibold text-green-800">{{ sellerName }}</div>
            <div class="text-sm text-gray-600">
              <span class="font-medium">Shipped To:</span> {{ order.shippingAddress }}
            </div>
            <div v-if="order.orderNote" class="text-sm text-gray-600">
              <span class="font-medium">Note:</span> {{ order.orderNote }}
            </div>
          </div>

          <div class="text-sm text-right text-gray-700 space-y-1">
            <div><span class="font-medium">Order No:</span> {{ order.id }}</div>
            <div><span class="font-medium">Order Date:</span> {{ formatDate(order.orderDate) }}</div>
            <div><span class="font-medium">Payment Date:</span> {{ formatDate(order.orderDate) }}</div>
            <div><span class="font-medium">Total:</span> {{ formatCurrency(calculateTotalPrice(order)) }}</div>
            <div><span class="font-medium">Status:</span> {{ order.orderStatus }}</div>
          </div>
        </div>

        <div class="mt-4 space-y-3">
          <div
            v-for="item in order.orderItems"
            :key="item.no"
            class="flex justify-between items-center border border-green-100 rounded-lg p-3 bg-green-50"
          >
            <div class="text-gray-800">{{ item.description }}</div>
            <div class="text-right text-sm">
              <div class="text-gray-600">Qty {{ item.quantity }}</div>
              <div class="font-medium text-green-700">
                Price: {{ formatCurrency(item.price * item.quantity) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <XPagination
      v-if="!loading.orders && orders.length"
      class="mt-10"
      :pagination="{
        currentPage: searchOptions.currentPage,
        pageSize: searchOptions.pageSize,
        total: searchOptions.totalItems
      }"
      :show-size-changer="true"
      @change="handlePaginationChange"
    />

    <div v-if="error.orders" class="text-center py-10">
      <p class="text-lg text-red-500">{{ error.orders }}</p>
    </div>
  </div>
</template>
